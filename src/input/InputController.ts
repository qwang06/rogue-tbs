import Phaser from "phaser";

/**
 * Input controller options
 */
export interface InputControllerOptions {
  /** Initial delay before key repeat starts (ms) */
  initialDelayMs?: number;
  /** Interval between repeated key events (ms) */
  repeatIntervalMs?: number;
}

/**
 * Key state for tracking hold-to-repeat behavior
 */
interface KeyState {
  /** Whether the key is currently pressed */
  isDown: boolean;
  /** Time elapsed since key was pressed (ms) */
  elapsedMs: number;
  /** Whether the key is in repeat mode */
  isRepeating: boolean;
  /** Timestamp when key was last pressed */
  lastPressedAt: number;
}

/**
 * Direction axis for preventing diagonal movement
 */
type Axis = "horizontal" | "vertical";

/**
 * InputController provides normalized input handling with key repeat functionality.
 * Supports WASD and Arrow keys for movement, Space/Enter for confirm, Escape/Backspace for cancel.
 * Emits high-level events that scenes can subscribe to.
 */
export class InputController {
  private scene: Phaser.Scene;
  private emitter: Phaser.Events.EventEmitter;
  private options: Required<InputControllerOptions>;

  // Key mappings
  private upKeys!: Phaser.Input.Keyboard.Key[];
  private downKeys!: Phaser.Input.Keyboard.Key[];
  private leftKeys!: Phaser.Input.Keyboard.Key[];
  private rightKeys!: Phaser.Input.Keyboard.Key[];
  private confirmKeys!: Phaser.Input.Keyboard.Key[];
  private cancelKeys!: Phaser.Input.Keyboard.Key[];

  // Key states for repeat logic
  private keyStates: Map<string, KeyState>;

  // Active axis tracking to prevent diagonals
  private activeAxis: Axis | null = null;
  private activeDirection: string | null = null;

  constructor(scene: Phaser.Scene, options: InputControllerOptions = {}) {
    this.scene = scene;
    this.emitter = new Phaser.Events.EventEmitter();
    this.options = {
      initialDelayMs: options.initialDelayMs ?? 250,
      repeatIntervalMs: options.repeatIntervalMs ?? 90,
    };

    this.keyStates = new Map();

    this.setupKeys();
    this.bindKeyEvents();
  }

  /**
   * Set up key mappings
   */
  private setupKeys(): void {
    if (!this.scene.input.keyboard) {
      throw new Error("Keyboard input not available");
    }

    const keyboard = this.scene.input.keyboard;

    // Direction keys
    this.upKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    ];

    this.downKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    ];

    this.leftKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    ];

    this.rightKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    ];

    // Action keys
    this.confirmKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    ];

    this.cancelKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE),
    ];

    // Initialize key states
    this.initializeKeyStates();
  }

  /**
   * Initialize key states for all tracked keys
   */
  private initializeKeyStates(): void {
    const allKeys = [
      ...this.upKeys,
      ...this.downKeys,
      ...this.leftKeys,
      ...this.rightKeys,
      ...this.confirmKeys,
      ...this.cancelKeys,
    ];

    for (const key of allKeys) {
      this.keyStates.set(key.keyCode.toString(), {
        isDown: false,
        elapsedMs: 0,
        isRepeating: false,
        lastPressedAt: 0,
      });
    }
  }

  /**
   * Bind key events
   */
  private bindKeyEvents(): void {
    // Direction key handlers
    this.bindDirectionKeys("up", this.upKeys, "vertical");
    this.bindDirectionKeys("down", this.downKeys, "vertical");
    this.bindDirectionKeys("left", this.leftKeys, "horizontal");
    this.bindDirectionKeys("right", this.rightKeys, "horizontal");

    // Action key handlers
    this.bindActionKeys("confirm", this.confirmKeys);
    this.bindActionKeys("cancel", this.cancelKeys);
  }

  /**
   * Bind direction keys with repeat logic
   */
  private bindDirectionKeys(
    direction: string,
    keys: Phaser.Input.Keyboard.Key[],
    axis: Axis
  ): void {
    for (const key of keys) {
      key.on("down", () => {
        const now = Date.now();
        const keyState = this.keyStates.get(key.keyCode.toString());

        if (!keyState || keyState.isDown) return;

        // Update key state
        keyState.isDown = true;
        keyState.elapsedMs = 0;
        keyState.isRepeating = false;
        keyState.lastPressedAt = now;

        // Update active direction (most recent wins)
        this.activeAxis = axis;
        this.activeDirection = direction;

        // Emit immediate event
        this.emitter.emit(`move:${direction}`);
      });

      key.on("up", () => {
        const keyState = this.keyStates.get(key.keyCode.toString());

        if (!keyState) return;

        keyState.isDown = false;
        keyState.elapsedMs = 0;
        keyState.isRepeating = false;

        // Clear active direction if this was the active key
        if (this.activeDirection === direction) {
          this.checkForNewActiveDirection(axis);
        }
      });
    }
  }

  /**
   * Check if there's another key pressed in the same axis and make it active
   */
  private checkForNewActiveDirection(releasedAxis: Axis): void {
    const axisKeys =
      releasedAxis === "vertical"
        ? [...this.upKeys, ...this.downKeys]
        : [...this.leftKeys, ...this.rightKeys];

    let newestPressedKey: { direction: string; time: number } | null = null;

    for (const key of axisKeys) {
      const keyState = this.keyStates.get(key.keyCode.toString());
      if (
        keyState?.isDown &&
        keyState.lastPressedAt > (newestPressedKey?.time || 0)
      ) {
        let direction: string;
        if (this.upKeys.includes(key)) direction = "up";
        else if (this.downKeys.includes(key)) direction = "down";
        else if (this.leftKeys.includes(key)) direction = "left";
        else direction = "right";

        newestPressedKey = { direction, time: keyState.lastPressedAt };
      }
    }

    if (newestPressedKey) {
      this.activeDirection = newestPressedKey.direction;
    } else {
      this.activeAxis = null;
      this.activeDirection = null;
    }
  }

  /**
   * Bind action keys (no repeat)
   */
  private bindActionKeys(
    action: string,
    keys: Phaser.Input.Keyboard.Key[]
  ): void {
    for (const key of keys) {
      key.on("down", () => {
        this.emitter.emit(action);
      });
    }
  }

  /**
   * Update the input controller - call this from scene's update method
   */
  update(deltaMs: number): void {
    if (!this.activeDirection) return;

    // Get keys for active direction
    let activeKeys: Phaser.Input.Keyboard.Key[];
    switch (this.activeDirection) {
      case "up":
        activeKeys = this.upKeys;
        break;
      case "down":
        activeKeys = this.downKeys;
        break;
      case "left":
        activeKeys = this.leftKeys;
        break;
      case "right":
        activeKeys = this.rightKeys;
        break;
      default:
        return;
    }

    // Find the active key state
    let activeKeyState: KeyState | null = null;
    for (const key of activeKeys) {
      const keyState = this.keyStates.get(key.keyCode.toString());
      if (keyState?.isDown) {
        activeKeyState = keyState;
        break;
      }
    }

    if (!activeKeyState) return;

    // Update elapsed time
    activeKeyState.elapsedMs += deltaMs;

    // Check if we should start repeating
    if (
      !activeKeyState.isRepeating &&
      activeKeyState.elapsedMs >= this.options.initialDelayMs
    ) {
      activeKeyState.isRepeating = true;
      activeKeyState.elapsedMs = 0; // Reset for repeat interval
      this.emitter.emit(`move:${this.activeDirection}`);
    }

    // Check if we should emit a repeat event
    if (
      activeKeyState.isRepeating &&
      activeKeyState.elapsedMs >= this.options.repeatIntervalMs
    ) {
      activeKeyState.elapsedMs = 0; // Reset for next repeat
      this.emitter.emit(`move:${this.activeDirection}`);
    }
  }

  /**
   * Subscribe to an event
   */
   
  on(event: string, callback: (...args: unknown[]) => void): this {
    this.emitter.on(event, callback);
    return this;
  }

  /**
   * Unsubscribe from an event
   */
   
  off(event: string, callback: (...args: unknown[]) => void): this {
    this.emitter.off(event, callback);
    return this;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Remove all event listeners from keys
    const allKeys = [
      ...this.upKeys,
      ...this.downKeys,
      ...this.leftKeys,
      ...this.rightKeys,
      ...this.confirmKeys,
      ...this.cancelKeys,
    ];

    for (const key of allKeys) {
      key.removeAllListeners();
    }

    // Clear state
    this.keyStates.clear();
    this.activeAxis = null;
    this.activeDirection = null;

    // Destroy emitter
    this.emitter.destroy();
  }
}
