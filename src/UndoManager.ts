class UndoAction {
    data: string
    parentGroup: ActionGroup | null = null
    onPerform: ((action: UndoAction) => void) | null = null

    constructor(data: string) {
        this.data = data
    }

    perform(): void {
        this.onPerform(this)
    }
}

class ActionGroup {
    actions: (UndoAction | ActionGroup)[]
    parentGroup: ActionGroup | null

    constructor() {
        this.actions = []
        this.parentGroup = null
    }

    addAction(action: UndoAction): void {
        action.parentGroup = this
        this.actions.push(action)
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
    private STATE_COLLECTING_ACTIONS = 'collectingActions'
    private STATE_UNDOING = 'undoing'
    private STATE_REDOING = 'redoing'

    private undoStack: ActionGroup[] = []
    private redoStack: ActionGroup[] = []
    private _state = this.STATE_COLLECTING_ACTIONS

    private _openGroupRef: ActionGroup | null = null
    private _groupLevel = 0
    private _maxUndoLevels: number | null = null

    onUndo: ((value: string) => void) | null = null
    onRedo: ((value: string) => void) | null = null

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
        if (!this.canUndo()) return

        this.endGrouping()
        this._state = this.STATE_UNDOING

        this.beginGrouping()
        this.undoStack.pop()?.perform()
        this.endGrouping()

        this._state = this.STATE_COLLECTING_ACTIONS
    }

    redo(): void {
        if (!this.canRedo()) return

        this._state = this.STATE_REDOING

        this.beginGrouping()
        this.redoStack.pop()?.perform()
        this.endGrouping()

        this._state = this.STATE_COLLECTING_ACTIONS
    }

    registerUndoAction(data: string): void {
        const action = new UndoAction(data)
        action.onPerform = this._onActionPerform.bind(this)

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
    }

    beginGrouping(): void {
        const newGroup = new ActionGroup()

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
    }

    clearUndo(): void {
        this.undoStack = []
    }

    private _wrappedAction(action: UndoAction): ActionGroup {
        const group = new ActionGroup()
        group.addAction(action)
        return group
    }

    private _onActionPerform(action: UndoAction): void {
        const callback = this._state === this.STATE_UNDOING ? this.onUndo : this.onRedo
        callback(action.data)
    }
}

export { UndoAction, ActionGroup, UndoManager }
