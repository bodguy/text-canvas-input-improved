class UndoAction {
    target: any
    func: (...args: any[]) => void
    arg: any[]
    data: any
    parentGroup: ActionGroup | null = null
    onperform: ((action: UndoAction) => void) | null = null

    constructor(target: any, func: (...args: any[]) => void, arg: any[], data: any) {
        this.target = target
        this.func = func
        this.arg = arg
        this.data = data
    }

    perform(): void {
        this.func.apply(this.target, this.arg)
        if (typeof this.onperform === 'function') {
            this.onperform(this)
        }
    }
}

class ActionGroup {
    actions: (UndoAction | ActionGroup)[] = []
    mode: string
    parentGroup: ActionGroup | null = null

    constructor(mode: string = UndoManager.COALESCE_MODE.NONE) {
        this.mode = mode
    }

    addAction(action: UndoAction): void {
        action.parentGroup = this

        switch (this.mode) {
            case UndoManager.COALESCE_MODE.FIRST:
                if (this.actions.length === 0) {
                    this.actions.push(action)
                }
                break

            case UndoManager.COALESCE_MODE.LAST:
                this.actions[0] = action
                break

            case UndoManager.COALESCE_MODE.CONSECUTIVE_DUPLICATES:
                if (
                    this.actions.length === 0 ||
                    action.func !== (this.actions[this.actions.length - 1] as UndoAction).func
                ) {
                    this.actions.push(action)
                }
                break

            case UndoManager.COALESCE_MODE.DUPLICATES:
                for (let i = this.actions.length - 1; i >= 0; i--) {
                    if ((this.actions[i] as UndoAction).func === action.func) {
                        this.actions.push(action)
                        break
                    }
                }
                break

            default:
                this.actions.push(action)
        }
    }

    addGroup(actionGroup: ActionGroup): void {
        actionGroup.parentGroup = this
        this.actions.push(actionGroup)
    }

    perform(): void {
        for (let i = this.actions.length - 1; i >= 0; i--) {
            this.actions[i].perform()
        }
    }
}

class UndoManager {
    static COALESCE_MODE = {
        NONE: 'none',
        FIRST: 'first',
        LAST: 'last',
        CONSECUTIVE_DUPLICATES: 'concecutiveDuplicates',
        DUPLICATES: 'duplicates'
    }

    private STATE_COLLECTING_ACTIONS = 'collectingActions'
    private STATE_UNDOING = 'undoing'
    private STATE_REDOING = 'redoing'

    private undoStack: ActionGroup[] = []
    private redoStack: ActionGroup[] = []
    private _state = this.STATE_COLLECTING_ACTIONS

    private _openGroupRef: ActionGroup | null = null
    private _groupLevel = 0
    private _maxUndoLevels: number | null = null

    onundo: ((data: { data: any; manager: UndoManager }) => void) | null = null
    onredo: ((data: { data: any; manager: UndoManager }) => void) | null = null
    onchange: ((manager: UndoManager) => void) | null = null

    setMaxUndoLevels(levels: number | null): void {
        this._maxUndoLevels = levels

        if (levels !== null) {
            while (this.undoStack.length > levels) {
                this.undoStack.shift()
            }
        }
    }

    getMaxUndoLevels(): number | null {
        return this._maxUndoLevels
    }

    canUndo(): boolean {
        return this.undoStack.length > 0 && this._state === this.STATE_COLLECTING_ACTIONS
    }

    canRedo(): boolean {
        return this.redoStack.length > 0 && this._state === this.STATE_COLLECTING_ACTIONS
    }

    getUndoActionsCount(): number {
        return this.undoStack.length
    }

    getRedoActionsCount(): number {
        return this.redoStack.length
    }

    undo(): void {
        if (!this.canUndo())
            throw new Error('Cannot undo, no undo actions on the stack or undo/redo operation in progress.')

        this.endGrouping()
        this._state = this.STATE_UNDOING

        this.beginGrouping()
        this.undoStack.pop()?.perform()
        this.endGrouping()

        this._state = this.STATE_COLLECTING_ACTIONS

        this._dispatch(this.onchange, { manager: this })
    }

    redo(): void {
        if (!this.canRedo())
            throw new Error('Cannot redo, no redo actions on the stack or undo/redo operation in progress.')

        this._state = this.STATE_REDOING

        this.beginGrouping()
        this.redoStack.pop()?.perform()
        this.endGrouping()

        this._state = this.STATE_COLLECTING_ACTIONS

        this._dispatch(this.onchange, { manager: this })
    }

    registerUndoAction(target: any, func: (...args: any[]) => void, arg: any[], data: any): void {
        if (typeof func !== 'function') {
            throw new TypeError(`Expected func to be of type function. ${typeof func} given.`)
        }

        const action = new UndoAction(target, func, arg, data)
        action.onperform = this._onActionPerform.bind(this)

        if (this._groupLevel !== 0) {
            this._openGroupRef?.addAction(action)
        } else {
            if (this._state === this.STATE_UNDOING) {
                this.redoStack.push(this._wrappedAction(action))
            } else {
                this.undoStack.push(this._wrappedAction(action))

                if (this._maxUndoLevels !== null && this.undoStack.length > this._maxUndoLevels) {
                    this.undoStack.shift()
                }
            }
        }

        if (this._state === this.STATE_COLLECTING_ACTIONS) {
            this.clearRedo()
        }

        this._dispatch(this.onchange, { manager: this })
    }

    beginGrouping(mode: string = UndoManager.COALESCE_MODE.NONE): void {
        const newGroup = new ActionGroup(mode)

        if (this._groupLevel === 0) {
            if (this._state === this.STATE_UNDOING) {
                this.redoStack.push(newGroup)
            } else {
                this.undoStack.push(newGroup)
            }
        } else {
            this._openGroupRef?.addGroup(newGroup)
        }

        this._openGroupRef = newGroup
        this._groupLevel++
    }

    endGrouping(): void {
        if (this._groupLevel > 0) {
            this._groupLevel--

            if (this._groupLevel === 0) {
                this._openGroupRef = null
            } else {
                this._openGroupRef = this._openGroupRef?.parentGroup || null
            }
        }
    }

    clearRedo(): void {
        this.redoStack = []
        this._dispatch(this.onchange, { manager: this })
    }

    clearUndo(): void {
        this.undoStack = []
        this._dispatch(this.onchange, { manager: this })
    }

    private _wrappedAction(action: UndoAction): ActionGroup {
        const group = new ActionGroup()
        group.addAction(action)
        return group
    }

    private _dispatch(callback: Function | null, arg: any): void {
        if (typeof callback === 'function') callback(arg)
    }

    private _onActionPerform(action: UndoAction): void {
        const callbackData = { data: action.data, manager: this }
        const callback = this._state === this.STATE_UNDOING ? this.onundo : this.onredo
        this._dispatch(callback, callbackData)
    }
}

export { UndoAction, ActionGroup, UndoManager }
