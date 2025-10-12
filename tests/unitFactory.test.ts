import { describe, it, expect, vi } from "vitest";
import {
  spawnUnit,
  spawnUnitFromData,
  createPredefinedUnit,
} from "../src/entities/unitFactory";
import { UNIT_TYPES } from "../src/config/unitTypes";
import { TILE_SIZE } from "../src/util/tile";

// Mock Phaser objects for testing
const createMockScene = () => ({
  add: {
    sprite: vi.fn().mockReturnValue({
      setOrigin: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      play: vi.fn().mockReturnThis(),
    }),
  },
  textures: {
    get: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({
        width: 32, // Mock frame width
      }),
    }),
  },
  anims: {
    exists: vi.fn().mockReturnValue(false), // Always create new animations in tests
    create: vi.fn(),
  },
});

describe("Unit Factory", () => {
  describe("spawnUnit (original function)", () => {
    it("should create sprite at correct tile position", () => {
      const mockScene = createMockScene() as any;
      const sprite = spawnUnit(mockScene, "test-key", "test-frame", 2, 3);

      // Should call add.sprite with tile center coordinates
      expect(mockScene.add.sprite).toHaveBeenCalledWith(
        2 * TILE_SIZE + TILE_SIZE / 2, // x = 40
        3 * TILE_SIZE + TILE_SIZE / 2, // y = 56
        "test-key",
        "test-frame"
      );
    });

    it("should set origin for feet alignment", () => {
      const mockScene = createMockScene() as any;
      const mockSprite = mockScene.add.sprite();
      const sprite = spawnUnit(mockScene, "test-key", "test-frame", 0, 0);

      // Should set origin to (0.5, 0.5) for bottom-center alignment
      expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
    });

    it("should scale sprite based on TILE_SIZE and frame width", () => {
      const mockScene = createMockScene() as any;
      const mockSprite = mockScene.add.sprite();

      // Mock frame width of 32px
      mockScene.textures.get().get.mockReturnValue({ width: 32 });

      const sprite = spawnUnit(mockScene, "test-key", "test-frame", 0, 0);

      // Should scale to fit TILE_SIZE (32px / 32px = 1.0)
      expect(mockSprite.setScale).toHaveBeenCalledWith(1.0);
    });

    it("should handle different frame widths correctly", () => {
      const mockScene = createMockScene() as any;
      const mockSprite = mockScene.add.sprite();

      // Mock frame width of 20px
      mockScene.textures.get().get.mockReturnValue({ width: 20 });

      const sprite = spawnUnit(mockScene, "test-key", "test-frame", 0, 0);

      // Should scale to fit TILE_SIZE (32px / 20px = 1.6)
      expect(mockSprite.setScale).toHaveBeenCalledWith(1.6);
    });

    it("should access correct texture and frame data", () => {
      const mockScene = createMockScene() as any;
      spawnUnit(mockScene, "archer", "idle-0", 1, 1);

      expect(mockScene.textures.get).toHaveBeenCalledWith("archer");
      expect(mockScene.textures.get().get).toHaveBeenCalledWith("idle-0");
    });
  });

  describe("createPredefinedUnit", () => {
    it("should create ACOLYTE_01 unit with correct properties", () => {
      const position = { tileX: 5, tileY: 3 };
      const unit = createPredefinedUnit("ACOLYTE_01", "unit_001", position);

      expect(unit.id).toBe("unit_001");
      expect(unit.name).toBe("Acolyte");
      expect(unit.unitType).toBe("Acolyte");
      expect(unit.position).toEqual(position);
      expect(unit.sprites.baseKey).toBe("acolyte_01");
      expect(unit.stats.hp).toBe(80);
      expect(unit.stats.maxHp).toBe(80);
      expect(unit.stats.mp).toBe(30);
      expect(unit.stats.magicAttack).toBe(25);
    });

    it("should create ACOLYTE_06 unit with correct properties", () => {
      const position = { tileX: 2, tileY: 7 };
      const unit = createPredefinedUnit("ACOLYTE_06", "unit_002", position);

      expect(unit.id).toBe("unit_002");
      expect(unit.name).toBe("Battle Acolyte");
      expect(unit.unitType).toBe("Acolyte");
      expect(unit.position).toEqual(position);
      expect(unit.sprites.baseKey).toBe("acolyte_06");
      expect(unit.stats.hp).toBe(90);
      expect(unit.stats.attack).toBe(28);
    });

    it("should create units with different stats for different types", () => {
      const position = { tileX: 0, tileY: 0 };
      const acolyte01 = createPredefinedUnit(
        "ACOLYTE_01",
        "unit_001",
        position
      );
      const acolyte06 = createPredefinedUnit(
        "ACOLYTE_06",
        "unit_002",
        position
      );

      // ACOLYTE_01 should be more magic-focused
      expect(acolyte01.stats.magicAttack).toBeGreaterThan(
        // @ts-ignore
        acolyte06.stats.magicAttack
      );
      expect(acolyte01.stats.mp).toBeGreaterThan(acolyte06.stats.mp);

      // ACOLYTE_06 should be more combat-focused
      expect(acolyte06.stats.attack).toBeGreaterThan(acolyte01.stats.attack);
      expect(acolyte06.stats.hp).toBeGreaterThan(acolyte01.stats.hp);
    });
  });

  describe("spawnUnitFromData", () => {
    it("should spawn unit sprite using unit data", () => {
      const mockScene = createMockScene() as any;
      const unit = createPredefinedUnit("ACOLYTE_01", "unit_001", {
        tileX: 3,
        tileY: 4,
      });

      const result = spawnUnitFromData(mockScene, unit);

      expect(result.unit).toBe(unit);
      expect(mockScene.add.sprite).toHaveBeenCalledWith(
        3 * TILE_SIZE + TILE_SIZE / 2, // x coordinate
        4 * TILE_SIZE + TILE_SIZE / 2, // y coordinate
        unit.sprites.idleKey, // Should use idle key for idle animation state
        0 // Front facing, frame 0 (numeric index for 4x4 grid)
      );
    });

    it("should create and play idle animation for spawned unit", () => {
      const mockScene = createMockScene() as any;
      const mockSprite = mockScene.add.sprite();
      const unit = createPredefinedUnit("ACOLYTE_01", "unit_001", {
        tileX: 1,
        tileY: 2,
      });

      const result = spawnUnitFromData(mockScene, unit);

      // Should create animations for all directions and states
      expect(mockScene.anims.create).toHaveBeenCalled();

      // Should play the appropriate idle animation
      expect(mockSprite.play).toHaveBeenCalledWith("acolyte_01_idle_front");
    });

    it("should use move sprite when unit is in move state", () => {
      const mockScene = createMockScene() as any;
      let unit = createPredefinedUnit("ACOLYTE_01", "unit_001", {
        tileX: 1,
        tileY: 2,
      });

      // Change unit to move state
      unit = { ...unit, animationState: "move" as const };

      const result = spawnUnitFromData(mockScene, unit);

      expect(mockScene.add.sprite).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        unit.sprites.moveKey, // Should use move key for move animation state
        0 // Front facing, frame 0 (numeric index)
      );
    });

    it("should use correct frame based on unit facing", () => {
      const mockScene = createMockScene() as any;
      const mockSprite = mockScene.add.sprite();
      let unit = createPredefinedUnit("ACOLYTE_01", "unit_001", {
        tileX: 0,
        tileY: 0,
      });

      // Change unit facing
      unit = { ...unit, facing: "left" as const };

      spawnUnitFromData(mockScene, unit);

      expect(mockScene.add.sprite).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        unit.sprites.idleKey,
        4 // Left facing is row 1, frame 0: 1 * 4 + 0 = 4 (numeric index for 4x4 grid)
      );

      // Should play left-facing idle animation
      expect(mockSprite.play).toHaveBeenCalledWith("acolyte_01_idle_left");
    });
  });

  describe("UNIT_TYPES configuration", () => {
    it("should have correct sprite keys for ACOLYTE_01", () => {
      const config = UNIT_TYPES.ACOLYTE_01;

      expect(config.sprites.baseKey).toBe("acolyte_01");
      expect(config.sprites.idleKey).toBe("acolyte_01_idle");
      expect(config.sprites.moveKey).toBe("acolyte_01_move");
      expect(config.sprites.portraitKey).toBe("acolyte_01_portrait");
    });

    it("should have correct sprite keys for ACOLYTE_06", () => {
      const config = UNIT_TYPES.ACOLYTE_06;

      expect(config.sprites.baseKey).toBe("acolyte_06");
      expect(config.sprites.idleKey).toBe("acolyte_06_idle");
      expect(config.sprites.moveKey).toBe("acolyte_06_move");
      expect(config.sprites.portraitKey).toBe("acolyte_06_portrait");
    });
  });
});
