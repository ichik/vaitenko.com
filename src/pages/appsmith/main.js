(function () {
    function ColorsAccessor(color) {
        this.color = new Color(color);
        return this;
    }
    ColorsAccessor.prototype = {
        get lightness() {
            return this.color.oklch.l;
        },
        get chroma() {
            return this.color.oklch.c;
        },
        get hue() {
            return this.color.oklch.h;
        },
        /* Lightness */
        get isVeryDark() {
            return this.color.oklch.l < 0.3;
        },
        get isVeryLight() {
            return this.color.oklch.l > 0.93;
        },
        /* Chroma */
        get isAchromatic() {
            return this.color.oklch.c < 0.04;
        },
        /* Hue */
        get isCold() {
            return this.color.oklch.h >= 120 && this.color.oklch.h <= 300;
        },
        get isGreen() {
            return this.color.oklch.h >= 116 && this.color.oklch.h <= 165;
        },
        get isYellow() {
            return this.color.oklch.h >= 60 && this.color.oklch.h <= 115;
        },
        get isRed() {
            return this.color.oklch.h >= 5 && this.color.oklch.h <= 49;
        }
    };

    function LightModeTheme(color) {
	const {
		chroma,
		color: seedColor,
		hue,
		isAchromatic,
		isCold,
		isGreen,
		isRed,
		isVeryLight,
		isYellow,
		lightness,
	} = new ColorsAccessor(color);

	this.seedColor = seedColor;
	this.seedLightness = lightness;
	this.seedChroma = chroma;
	this.seedHue = hue;
	this.seedIsAchromatic = isAchromatic;
	this.seedIsCold = isCold;
	this.seedIsGreen = isGreen;
	this.seedIsRed = isRed;
	this.seedIsVeryLight = isVeryLight;
	this.seedIsYellow = isYellow;

	Object.defineProperty(this, "bg", {
		get: function () {
			const color = this.seedColor.clone();

			color.oklch.l = 0.97;

			if (this.seedIsCold) {
				color.oklch.c = 0.002;
			} else {
				color.oklch.c = 0.001;
			}

			if (this.seedIsAchromatic) {
				color.oklch.c = 0;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgAccent", {
		get: function () {
			// Main accent color. Largely is the same as user-set seed color.
			const color = this.seedColor.clone();

			// If seed is very light, make sure that the accent is visible and saturated enough.
			if (this.seedIsVeryLight && this.seedColor.oklch.c >= 0.02) {
				color.oklch.l = 0.75;
				color.oklch.c = 0.1;
			}

			// If seed is achromatic make sure we don't produce parasitic coloring and make accent really dark. Our standard achromatic cut-off is set too high for the very light seeds, so using chroma value checks instead.
			if (this.seedIsVeryLight && this.seedColor.oklch.c < 0.02) {
				color.oklch.l = 0.3;
				color.oklch.c = 0;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgAccentHover", {
		get: function () {
			// Hover state of bgAccent. Slightly lighter than the resting state to produce the effect of moving closer to the viewer / inspection.
			const color = this.bgAccent.clone();

			// “Slightly lighter” is very dependent on the initial amount of lightness as well as how light (or dark) the surroundings are.
			if (this.seedLightness < 0.06) {
				color.oklch.l += 0.28;
			}

			if (this.seedLightness > 0.06 && this.seedLightness < 0.14) {
				color.oklch.l += 0.2;
			}

			if (
				this.seedLightness >= 0.14 &&
				this.seedLightness < 0.21 &&
				this.seedIsCold
			) {
				color.oklch.l += 0.1;
			}

			// Warm colors require a little bit more lightness in this range than colds to be sufficiently perceptually lighter.
			if (
				this.seedLightness >= 0.14 &&
				this.seedLightness < 0.21 &&
				!this.seedIsCold
			) {
				color.oklch.l += 0.13;
			}

			if (this.seedLightness >= 0.21 && this.seedLightness < 0.4) {
				color.oklch.l += 0.09;
			}

			if (this.seedLightness >= 0.4 && this.seedLightness < 0.7) {
				color.oklch.l += 0.05;
			}

			if (this.seedLightness >= 0.7) {
				color.oklch.l += 0.03;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgAccentActive", {
		get: function () {
			// Active state of bgAccent. Slightly darker than the resting state to produce the effect of moving further from the viewer / being pushed down.
			const color = this.bgAccent.clone();

			// “Slightly darker” is very dependent on the initial amount of lightness as well as how light (or dark) the surroundings are.
			if (this.seedLightness < 0.4) {
				color.oklch.l -= 0.04;
			}

			if (this.seedLightness >= 0.4 && this.seedLightness < 0.7) {
				color.oklch.l -= 0.02;
			}

			if (this.seedLightness >= 0.7) {
				color.oklch.l -= 0.01;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgAccentSubtle", {
		get: function () {
			// Subtle variant of bgAccent. Lighter and less saturated.
			const color = this.seedColor.clone();

			if (this.seedIsVeryLight) {
				color.oklch.l = 0.955;
			}

			if (!this.seedIsVeryLight) {
				color.oklch.l = 0.93;
			}

			// Colder seeds require a bit more chroma to not seem completely washed out
			if (this.seedChroma > 0.09 && this.seedIsCold) {
				color.oklch.c = 0.09;
			}

			if (this.seedChroma > 0.06 && !this.seedIsCold) {
				color.oklch.c = 0.06;
			}

			if (this.seedIsAchromatic) {
				color.oklch.c = 0;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgAccentSubtleHover", {
		get: function () {
			const color = this.bgAccentSubtle.clone();

			color.oklch.l += 0.02;

			return color;
		},
	});

	Object.defineProperty(this, "bgAccentSubtleActive", {
		get: function () {
			const color = this.bgAccentSubtle.clone();

			color.oklch.l -= 0.01;

			return color;
		},
	});

	Object.defineProperty(this, "bgAssistive", {
		get: function () {
			const color = this.seedColor.clone();

			// Background color for assistive UI elements (e.g. tooltip); dark to stand out against bg
			color.oklch.l = 0.16;
			color.oklch.c = 0.07;

			if (this.seedIsAchromatic) {
				color.oklch.c = 0;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutral", {
		get: function () {
			// Low chroma, but not 0, if possible, to produce harmony with accents in the UI
			const color = this.bgAccent.clone();

			// For bright accents it helps to make neutral a bit darker to differentiate with bgAccent
			if (this.bgAccent.oklch.l >= 0.7) {
				color.oklch.l -= 0.55;
			}

			if (this.bgAccent.oklch.l > 0.2 && this.bgAccent.oklch.l < 0.85) {
				color.oklch.l -= 0.35;
			}

			if (this.seedIsAchromatic) {
				color.oklch.c = 0;
			}

			if (this.seedIsCold && !this.seedIsAchromatic) {
				color.oklch.c = 0.002;
			}

			if (!this.seedIsCold && !this.seedIsAchromatic) {
				color.oklch.c = 0.001;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralOpacity", {
		get: function () {
			// Overlay behind modal dialogue
			const color = this.bgNeutral.clone();

			color.alpha = 0.6;

			if (color.oklch.l > 0.15) {
				color.oklch.l = 0.15;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralHover", {
		get: function () {
			const color = this.bgNeutral.clone();

			// Simplified and adjusted version of bgAccentHover algorithm (bgNeutral has very low or no chroma)

			if (this.bgNeutral.oklch.l < 0.06) {
				color.oklch.l += 0.3;
			}

			if (this.bgNeutral.oklch.l > 0.06 && this.bgNeutral.oklch.l < 0.14) {
				color.oklch.l += 0.19;
			}

			if (this.bgNeutral.oklch.l >= 0.14 && this.bgNeutral.oklch.l < 0.21) {
				color.oklch.l += 0.11;
			}

			if (this.bgNeutral.oklch.l >= 0.21 && this.bgNeutral.oklch.l < 0.7) {
				color.oklch.l += 0.07;
			}

			if (this.bgNeutral.oklch.l >= 0.7 && this.bgNeutral.oklch.l < 0.955) {
				color.oklch.l += 0.04;
			}

			if (this.bgNeutral.oklch.l >= 0.955) {
				color.oklch.l = 0.94;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralActive", {
		get: function () {
			const color = this.bgNeutral.clone();

			// Simplified and adjusted version of bgAccentActive algorithm (bgNeutral has very low or no chroma)
			if (this.bgNeutral.oklch.l < 0.4) {
				color.oklch.l -= 0.03;
			}

			if (this.bgNeutral.oklch.l >= 0.4 && this.bgNeutral.oklch.l < 0.955) {
				color.oklch.l -= 0.01;
			}

			if (this.bgNeutral.oklch.l >= 0.955) {
				color.oklch.l = 0.925;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSubtle", {
		get: function () {
			const color = this.bgAccentSubtle.clone();

			// Adjusted version of bgAccentSubtle (less or no chroma), slightly higher lightness since neutrals are perceived heavier than saturated colors
			if (this.seedIsVeryLight) {
				color.oklch.l = 0.955;
			}

			if (!this.seedIsVeryLight) {
				color.oklch.l = 0.97;
			}

			if (this.seedChroma > 0.002) {
				color.oklch.c = 0.002;
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSubtleHover", {
		get: function () {
			const color = this.bgNeutralSubtle.clone();

			color.oklch.l += 0.012;

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSubtleActive", {
		get: function () {
			const color = this.bgNeutralSubtle.clone();

			color.oklch.l -= 0.01;

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSoft", {
		get: function () {
			const color = this.bgNeutralSubtle.clone();

			color.oklch.l -= 0.045;

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSoftHover", {
		get: function () {
			const color = this.bgNeutralSoft.clone();

			color.oklch.l += 0.015;

			return color;
		},
	});

	Object.defineProperty(this, "bgNeutralSoftActive", {
		get: function () {
			const color = this.bgNeutralSoft.clone();

			color.oklch.l -= 0.015;

			return color;
		},
	});

	Object.defineProperty(this, "bgPositive", {
		get: function () {
			// Positive background, green.
			const color = new Color("oklch", [0.62, 0.19, 145]);

			// If the seed color is also green, adjust positive by hue to make it distinct from accent.
			if (this.seedIsGreen && this.seedChroma > 0.11) {
				if (this.seedHue < 145) {
					color.oklch.h = 155;
				}

				if (this.seedHue >= 145) {
					color.oklch.h = 135;
				}
			}

			return color;
		},
	});

	Object.defineProperty(this, "bgPositiveHover", {
		get: function () {
			const color = this.bgPositive.clone();

			// Lightness of bgPositive is known, no additional checks like in bgAccentHover
			color.oklch.l += 0.05;

			return color;
		},
	});

	// Method to get all colors
	this.getColors = function () {
		return {
			bg: this.bg.to("sRGB").toString(),
			bgAccent: this.bgAccent.to("sRGB").toString(),
			bgAccentHover: this.bgAccentHover.to("sRGB").toString(),
			bgAccentActive: this.bgAccentActive.to("sRGB").toString(),
			bgAccentSubtle: this.bgAccentSubtle.to("sRGB").toString(),
			bgAccentSubtleHover: this.bgAccentSubtleHover.to("sRGB").toString(),
			bgAccentSubtleActive: this.bgAccentSubtleActive.to("sRGB").toString(),
			bgAssistive: this.bgAssistive.to("sRGB").toString(),
			bgNeutral: this.bgNeutral.to("sRGB").toString(),
			bgNeutralOpacity: this.bgNeutralOpacity.to("sRGB").toString(),
			bgNeutralHover: this.bgNeutralHover.to("sRGB").toString(),
			bgNeutralActive: this.bgNeutralActive.to("sRGB").toString(),
			bgNeutralSubtle: this.bgNeutralSubtle.to("sRGB").toString(),
			bgNeutralSubtleHover: this.bgNeutralSubtleHover.to("sRGB").toString(),
			bgNeutralSubtleActive: this.bgNeutralSubtleActive.to("sRGB").toString(),
			bgNeutralSoft: this.bgNeutralSoft.to("sRGB").toString(),
			bgNeutralSoftHover: this.bgNeutralSoftHover.to("sRGB").toString(),
			bgNeutralSoftActive: this.bgNeutralSoftActive.to("sRGB").toString(),
			bgPositive: this.bgPositive.to("sRGB").toString(),
			bgPositiveHover: this.bgPositiveHover.to("sRGB").toString(),
		};
	};
}

    if (typeof window !== "undefined") {
        window.LightModeTheme = LightModeTheme;
    } else {
        global.LightModeTheme = LightModeTheme;
    }
})();