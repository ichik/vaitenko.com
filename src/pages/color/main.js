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
        },
    };

    function LightTheme(color) {
        const {
            chroma,
            color: seedColor,
            hue,
            isAchromatic,
            isCold,
            isGreen,
            isRed,
            isVeryLight,
            isVeryDark,
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
        this.seedIsVeryDark = isVeryDark;
        this.seedIsYellow = isYellow;

        Object.defineProperty(this, 'bg', {
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

        Object.defineProperty(this, 'bgAccent', {
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

        Object.defineProperty(this, 'bgAccentHover', {
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

                if (this.seedLightness >= 0.14 && this.seedLightness < 0.21 && this.seedIsCold) {
                    color.oklch.l += 0.1;
                }

                // Warm colors require a little bit more lightness in this range than colds to be sufficiently perceptually lighter.
                if (this.seedLightness >= 0.14 && this.seedLightness < 0.21 && !this.seedIsCold) {
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

        Object.defineProperty(this, 'bgAccentActive', {
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

        Object.defineProperty(this, 'bgAccentSubtle', {
            get: function () {
                // Subtle variant of bgAccent. Lighter and less saturated.
                const color = this.seedColor.clone();

                if (this.seedIsVeryLight) {
                    color.oklch.l = 0.935;
                }

                if (!this.seedIsVeryLight) {
                    color.oklch.l = 0.91;
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

        Object.defineProperty(this, 'bgNeutralSubtle', {
            get: function () {
                const color = this.bgAccentSubtle.clone();

                // Adjusted version of bgAccentSubtle (less or no chroma), slightly higher lightness since neutrals are perceived heavier than saturated colors
                if (this.seedIsVeryLight) {
                    color.oklch.l = 0.89;
                }

                if (!this.seedIsVeryLight) {
                    color.oklch.l = 0.92;
                }

                if (this.seedChroma > 0.002) {
                    color.oklch.c = 0.002;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fg', {
            get: function () {
                // Main application foreground color.
                // Applies to static text and similar. In dark mode it is light (and therefore desatured) tint of user-set seed color.
                // This ensures harmonious combination with main accents and neutrals.
                const color = this.seedColor.clone();

                color.oklch.l = 0.91;

                // If seed color didn't have substantial amount of chroma make sure fg is achromatic.
                if (this.seedIsAchromatic) {
                    color.oklch.c = 0;
                }

                if (!this.seedIsAchromatic) {
                    color.oklch.c = 0.065;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fgNeutral', {
            get: function () {
                // Neutral foreground. Slightly less prominent than main fg
                const color = this.fg.clone();

                color.oklch.l -= 0.05;
                color.oklch.c -= 0.04;

                if (color.oklch.c < 0) {
                    color.oklch.c = 0;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fgNeutralSubtle', {
            get: function () {
                const color = this.fgNeutral.clone();

                color.oklch.l -= 0.2;

                return color;
            },
        });

        Object.defineProperty(this, 'fgOnAccent', {
            get: function () {
                // Foreground for content on top of bgAccent
                const tint = this.seedColor.clone();
                const shade = this.seedColor.clone();

                if (this.seedIsAchromatic) {
                    tint.oklch.c = 0;
                    shade.oklch.c = 0;
                }

                // Light and dark derivatives of the seed
                tint.oklch.l = 0.96;
                shade.oklch.l = 0.23;

                // Chroma limits for tint and shade
                if (tint.oklch.c >= 0.015) {
                    tint.oklch.c = 0.015;
                }

                if (shade.oklch.c >= 0.03) {
                    shade.oklch.c = 0.03;
                }

                // Check which of them has better contrast with bgAccent
                if (-this.bgAccent.contrastAPCA(tint) >= this.bgAccent.contrastAPCA(shade)) {
                    return tint;
                }

                return shade;
            },
        });

        // Method to get all colors
        this.getColors = function () {
            return {
                bg: this.bg.to('sRGB').toString(),
                bgAccent: this.bgAccent.to('sRGB').toString(),
                bgAccentHover: this.bgAccentHover.to('sRGB').toString(),
                bgAccentActive: this.bgAccentActive.to('sRGB').toString(),
                bgAccentSubtle: this.bgAccentSubtle.to('sRGB').toString(),
                bgNeutralSubtle: this.bgNeutralSubtle.to('sRGB').toString(),
                fg: this.fg.to('sRGB').toString(),
                fgNeutral: this.fgNeutral.to('sRGB').toString(),
                fgNeutralSubtle: this.fgNeutralSubtle.to('sRGB').toString(),
                fgOnAccent: this.fgOnAccent.to('sRGB').toString(),
            };
        };
    }

    function DarkTheme(color) {
        const {
            chroma,
            color: seedColor,
            hue,
            isAchromatic,
            isCold,
            isGreen,
            isRed,
            isVeryLight,
            isVeryDark,
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
        this.seedIsVeryDark = isVeryDark;
        this.seedIsYellow = isYellow;

        Object.defineProperty(this, 'bg', {
            get: function () {
                const color = this.seedColor.clone();

                color.oklch.l = 0.15;

                // If initial seed had non-substantial amount of chroma, make sure bg is achromatic.
                if (this.seedIsAchromatic) {
                    color.oklch.c = 0;
                }

                if (!this.seedIsAchromatic && this.seedIsCold) {
                    color.oklch.c = 0.029;
                }

                if (!this.seedIsAchromatic && !this.seedIsCold) {
                    color.oklch.c = 0.012;
                }
                return color;
            },
        });

        Object.defineProperty(this, 'bgAccent', {
            get: function () {
                const color = this.seedColor.clone();

                // If the seed is very dark, set it to minimal lightness to make sure it's visible against bg.
                if (this.seedIsVeryDark) {
                    color.oklch.l = 0.3;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'bgAccentHover', {
            get: function () {
                // Hover state of bgAccent. Slightly lighter than the resting state to produce the effect of moving closer to the viewer / inspection.
                const color = this.bgAccent.clone();

                // “Slightly lighter” is very dependent on the initial amount of lightness as well as how light (or dark) the surroundings are.
                if (this.seedLightness < 0.06) {
                    color.oklch.l += 0.08;
                }

                if (this.seedLightness > 0.06 && this.seedLightness < 0.14) {
                    color.oklch.l += 0.2;
                }

                if (this.seedLightness >= 0.14 && this.seedLightness < 0.21 && this.seedIsCold) {
                    color.oklch.l += 0.1;
                }

                // Warm colors require a little bit more lightness in this range than colds to be sufficiently perceptually lighter.
                if (this.seedLightness >= 0.14 && this.seedLightness < 0.21 && !this.seedIsCold) {
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

        Object.defineProperty(this, 'bgAccentActive', {
            get: function () {
                // Active state of bgAccent. Slightly darker than the resting state to produce the effect of moving further from the viewer / being pushed down.
                const color = this.bgAccent.clone();

                // “Slightly darker” is very dependent on the initial amount of lightness as well as how light (or dark) the surroundings are.
                if (this.seedLightness < 0.4) {
                    color.oklch.l -= 0.04;
                }

                if (this.seedLightness >= 0.4 && this.seedLightness < 0.7) {
                    color.oklch.l -= 0.08;
                }

                if (this.seedLightness >= 0.7) {
                    color.oklch.l -= 0.12;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'bgAccentSubtle', {
            get: function () {
                // Subtle variant of bgAccent. Darker and less saturated.
                const color = this.seedColor.clone();

                if (this.seedLightness > 0.22) {
                    color.oklch.l = 0.22;
                }

                // If the color is too dark it won't be visible against bg.
                if (this.seedLightness < 0.2) {
                    color.oklch.l = 0.2;
                }

                if (this.seedChroma > 0.1) {
                    color.oklch.c = 0.1;
                }

                if (this.seedIsAchromatic) {
                    color.oklch.c = 0;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'bgNeutralSubtle', {
            get: function () {
                const color = this.bgAccentSubtle.clone();

                // Adjusted version of bgAccentSubtle (less or no chroma)
                if (this.seedLightness > 0.26) {
                    color.oklch.l = 0.26;
                }

                // If the color is too dark it won't be visible against bg.
                if (this.seedLightness < 0.22) {
                    color.oklch.l = 0.22;
                }

                if (this.seedChroma > 0.025) {
                    color.oklch.c = 0.025;
                }

                if (this.seedIsAchromatic) {
                    color.oklch.c = 0;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fg', {
            get: function () {
                // Main application foreground color.
                // Applies to static text and similar. In light mode it is dark shade of user-set seed color.
                // This ensures harmonious combination with main accents and neutrals.
                const color = this.seedColor.clone();

                color.oklch.l = 0.37;

                // If seed color didn't have substantial amount of chroma make sure fg is achromatic.
                if (this.seedIsAchromatic) {
                    color.oklch.c = 0;
                }

                if (!this.seedIsAchromatic) {
                    color.oklch.c = 0.039;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fgNeutral', {
            get: function () {
                // Neutral foreground. Slightly less prominent than main fg
                const color = this.fg.clone();

                color.oklch.l += 0.05;
                color.oklch.c -= 0.02;

                if (color.oklch.c < 0) {
                    color.oklch.c = 0;
                }

                return color;
            },
        });

        Object.defineProperty(this, 'fgNeutralSubtle', {
            get: function () {
                const color = this.fgNeutral.clone();

                color.oklch.l += 0.12;

                return color;
            },
        });

        Object.defineProperty(this, 'fgOnAccent', {
            get: function () {
                // Foreground for content on top of bgAccent
                const tint = this.seedColor.clone();
                const shade = this.seedColor.clone();

                if (this.seedIsAchromatic) {
                    tint.oklch.c = 0;
                    shade.oklch.c = 0;
                }

                // Light and dark derivatives of the seed
                tint.oklch.l = 0.96;
                shade.oklch.l = 0.23;

                // Chroma limits for tint and shade
                if (tint.oklch.c >= 0.015) {
                    tint.oklch.c = 0.015;
                }

                if (shade.oklch.c >= 0.03) {
                    shade.oklch.c = 0.03;
                }

                // Check which of them has better contrast with bgAccent
                if (-this.bgAccent.contrastAPCA(tint) >= this.bgAccent.contrastAPCA(shade)) {
                    return tint;
                }

                return shade;
            },
        });

        // Method to get all colors
        this.getColors = function () {
            return {
                bg: this.bg.to('sRGB').toString(),
                bgAccent: this.bgAccent.to('sRGB').toString(),
                bgAccentHover: this.bgAccentHover.to('sRGB').toString(),
                bgAccentActive: this.bgAccentActive.to('sRGB').toString(),
                bgAccentSubtle: this.bgAccentSubtle.to('sRGB').toString(),
                bgNeutralSubtle: this.bgNeutralSubtle.to('sRGB').toString(),
                fg: this.fg.to('sRGB').toString(),
                fgNeutral: this.fgNeutral.to('sRGB').toString(),
                fgNeutralSubtle: this.fgNeutralSubtle.to('sRGB').toString(),
                fgOnAccent: this.fgOnAccent.to('sRGB').toString(),
            };
        };
    }
    if (typeof window !== 'undefined') {
        window.LightTheme = LightTheme;
        window.DarkTheme = DarkTheme;
    } else {
        global.LightTheme = LightTheme;
        global.DarkTheme = DarkTheme;
    }
})();
