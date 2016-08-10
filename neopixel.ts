/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
    Red = 0xFF0000,
    Orange = 0xFFA500,
    Yellow = 0xFFFF00,
    Green = 0x00FF00,
    Blue = 0x0000FF,
    Indigo = 0x4b0082,
    Violet = 0x8a2be2,
    Purple = 0xFF00FF
}

/**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
export enum NeoPixelMode {
    RGB,
    RGBW
}

/**
 * Functions to operate NeoPixel strips.
 */
//% weight=5 color=#2699BF
namespace neopixel {
    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) {
    }

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b). 
         * @param color RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="%strip|show color %rgb=neopixel_colors" 
        //% weight=85 blockGap=8
        showColor(rgb: number) {
            if (this._mode == NeoPixelMode.RGB) {
                this.setAllRGB(rgb);
            } else {
                let rgbw = rgbToRGBW(rgb);
                this.setAllRGBW(rgbw);
            }
            this.show();
        }

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b, w). 
         * @param color RGBW color of the LED
         */
        //% blockId="neopixel_set_strip_rgbw" block="%strip|show color %rgbw" 
        //% weight=85 blockGap=8
        showRGBW(rgbw: number) {
            this.setAllRGBW(rgbw);
            this.show();
        }

        private setAllRGB(rgb: number) {
            let [red,green,blue] = unpack3(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 3;
                buf[ledoffset + 0] = green;
                buf[ledoffset + 1] = red;
                buf[ledoffset + 2] = blue;
            }
        }
        private setAllRGBW(rgbw: number) {
            let [red, green, blue, white] = unpack4(rgbw);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 0] = green;
                buf[ledoffset + 1] = red;
                buf[ledoffset + 2] = blue;
                buf[ledoffset + 3] = white;
            }
        }

        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, eg: 255
         */
        //% weight=84
        //% blockId=neopixel_show_bar_graph block="%strip|show bar graph of %value |up to %high" icon="\uf080" blockExternalInputs=true
        showBarGraph(value: number, high: number): void {
            if (high <= 0) {
                this.clear();
                return;
            }

            value = Math.abs(value);
            const n = this._length;
            const n1 = n - 1;
            let v = (value * n) / high;
            if (v == 0) {
                this.setPixelColor(0, 0x666600);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        let b = i * 255 / n1;
                        this.setPixelColor(i, neopixel.rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
         * Set LED to a given color (range 0-255 for r, g, b). 
         * You need to call ``show`` to make the changes visible.
         * @param ledoffset position of the LED in the strip
         * @param color RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %ledoff|to %color=neopixel_colors" 
        //% blockGap=8
        //% weight=80
        setPixelColor(ledoffset: number, rgb: number): void {
            if (this._mode == NeoPixelMode.RGB) {
                this.setPixelRGB(ledoffset, rgb);
            } else {
                let rgbw = rgbToRGBW(rgb);
                this.setPixelRGBW(ledoffset, rgbw);
            }
        }

        private setPixelRGB(ledoffset: number, rgb: number): void {
            if (ledoffset < 0
                || ledoffset >= this._length)
                return;

            ledoffset = (ledoffset + this.start) * 3;

            let [red,green,blue] = unpack3(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            let buf = this.buf;
            buf[ledoffset + 0] = green;
            buf[ledoffset + 1] = red;
            buf[ledoffset + 2] = blue;
        }

        /**
         * Set LED to a given color and whiteness (range 0-255 for r, g, b, w). 
         * You need to call ``show`` to make the changes visible.
         * @param ledoffset position of the LED in the strip
         * @param color RGBW color of the LED
         */
        //% blockId="neopixel_set_pixel_rgbw" block="%strip|set pixel color at %ledoff|to %rgbw=0" 
        //% blockGap=8
        //% weight=80
        setPixelRGBW(ledoffset: number, rgbw: number): void {
            if (ledoffset < 0
                || ledoffset >= this._length)
                return;

            ledoffset = (ledoffset + this.start) * 4;

            let [red,green,blue,white] = unpack4(rgbw);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[ledoffset + 0] = green;
            buf[ledoffset + 1] = red;
            buf[ledoffset + 2] = blue;
            buf[ledoffset + 3] = white;
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" block="%strip|show" blockGap=8
        //% weight=79
        show() {
            basic.pause(1)
            sendBuffer(this.buf, this.pin);
        }

        /**
         * Turn off all LEDs and shows.
         */
        //% blockId="neopixel_clear" block="%strip|clear"
        //% weight=76
        clear(): void {
            this.buf.fill(0, this.start, this._length);
            this.show();
        }

        /**
         * Gets the number of pixels declared on the strip
         */
        //% blockId="neopixel_length" block="%strip|length" blockGap=8
        //% weight=60
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip, 0-255. eg: 255
         */
        //% blockId="neopixel_set_brightness" block="%strip|set brightness %brightness" blockGap=8
        //% weight=59
        setBrigthness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /** 
         * Create a range of LEDs.
         * @param start offset in the LED strip to start the range
         * @param length number of LEDs in the range. eg: 4
         */
        //% weight=89
        //% blockId="neopixel_range" block="%strip|range from %start|with %length|leds"
        range(start: number, length: number): Strip {
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="neopixel_shift" block="%strip|shift pixels by %offset" blockGap=8
        //% weight=40
        shift(offset: number = 1): void {
            let stride = this._mode === NeoPixelMode.RGB ? 3 : 4;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward, eg: 1
         */
        //% blockId="neopixel_rotate" block="%strip|rotate pixels by %offset" blockGap=8
        //% weight=39
        rotate(offset: number = 1): void {
            let stride = this._mode === NeoPixelMode.RGB ? 3 : 4;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Set the pin where the neopixel is connected, defaults to P0.
         */
        //% weight=10
        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0)
            basic.pause(50)
        }
    }

    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% blockId="neopixel_create" block="neopixel|at pin %pin|with %numleds|leds in %mode|mode"
    //% weight=90 blockGap=8
    export function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode): Strip {
        let strip = new Strip();
        let stride = mode === NeoPixelMode.RGB ? 3 : 4;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.setBrigthness(255)
        strip.setPin(pin)
        strip.start = 0;
        strip._length = numleds;
        strip._mode = mode;
        return strip;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return pack3(red,green,blue);
    }

    /**
     * Converts red, green, blue, and white channels into a RGBW color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     * @param white value of the white channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue|white %white"
    export function rgbw(red: number, green: number, blue: number, white: number): number {
        return pack4(red,green,blue,white);
    }


    /**
     * Converts hue, saturation, luminosity channels into a RGB color
     * @param hue value of the hue channel between 0 and 360. eg: 360
     * @param sat value of the saturation channel between 0 and 100. eg: 100
     * @param lum value of the luminosity channel between 0 and 100. eg: 100
     */
    //% weight=1
    //% blockId="neopixel_hsl" block="hue %hue|sat %sat|lum %lum"
    export function hsl(hue: number, sat: number, lum: number): number {
        return hslToRgb(hue, sat, lum);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    export function colors(color: NeoPixelColors): number {
        return color;
    }


    function rgbToRGBW(rgb: number) {
        let [r,g,b] = unpack3(rgb);
        let w = 0;
        return pack4(r,g,b,w);
    }
    function rgbwToRGB(rgbw: number) {
        let [r,g,b,w] = unpack4(rgbw);
        return pack3(r,g,b);
    }

    function pack2(a: number, b: number): number {
        return ((a & 0xFF) << 8) | (b & 0xFF);
    }
    function unpack2(ab: number): [number, number] {   
        let a = (ab >> 8) & 0xFF;
        let b = (ab) & 0xFF;
        return [a,b];
    }
    function pack3(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpack3(abc: number): [number, number, number] {   
        let a = (abc >> 16) & 0xFF;
        let b = (abc >> 8) & 0xFF;
        let c = (abc) & 0xFF;
        return [a,b,c];
    }
    function pack4(a: number, b: number, c: number, d: number): number {
        return ((a & 0xFF) << 24) | ((b & 0xFF) << 16) | ((c & 0xFF) << 8) | d;
    }
    function unpack4(abcd: number): [number, number, number, number] {  
        let a = (abcd >> 24) & 0xFF; 
        let b = (abcd >> 16) & 0xFF;
        let c = (abcd >> 8) & 0xFF;
        let d = (abcd) & 0xFF;
        return [a,b,c,d];
    }
    function pack5(a: number, b: number, c: number, d: number, e: number): number {
        return ((a & 0xFF) << 32) 
            | ((b & 0xFF) << 24) 
            | ((c & 0xFF) << 16) 
            | ((d & 0xFF) << 8) 
            | e;
    }
    function unpack5(abcde: number): [number, number, number, number, number] {  
        let a = (abcde >> 32) & 0xFF; 
        let b = (abcde >> 24) & 0xFF; 
        let c = (abcde >> 16) & 0xFF;
        let d = (abcde >> 8) & 0xFF;
        let e = (abcde) & 0xFF;
        return [a,b,c,d,e];
    }

    function packHSL(h: number, s: number, l: number): number {
        let [h1, h2] = unpack2(h);
        return pack4(h1,h2,s,l);
    }
    function unpackHSL(hsl: number): [number, number, number] {  
        let [h1, h2, s, l] = unpack4(hsl);
        let h = pack2(h1,h2);
        return [h,s,l];
    }
    function packHSLW(h: number, s: number, l: number, w: number): number {
        let [h1, h2] = unpack2(h);
        return pack5(h1,h2,s,l,w);
    }
    function unpackHSLW(hslw: number): [number, number, number, number] {  
        let [h1, h2, s, l, w] = unpack5(hslw);
        let h = pack2(h1,h2);
        return [h,s,l,w];
    }

    /**
     * Converts from an RGB (red, green, blue) format color to an HSL (hue, 
     * saturation, luminosity) format color. Input r, g, b ranges between [0,255], 
     * and output ranges h between [0,260], s between [0, 100], and l between [0, 100]
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_rgb_to_hsl" block="%rgb"
    export function rgbToHsl(rgb: number): number {
        //reference: https://en.wikipedia.org/wiki/HSL_and_HSV
        let [r, g, b] = unpack3(rgb);
        let [r$, g$, b$] = [r/255, g/255, b/255];
        let cMin = Math.min(r$, g$, b$);
        let cMax = Math.max(r$, g$, b$);
        let cDelta = cMax - cMin;
        let h: number, s: number, l: number;
        let maxAndMin = cMax + cMin;

        //lum
        l = (maxAndMin / 2)*100
        
        if (cDelta === 0)
            s = h = 0;
        else {
            //hue
            if (cMax === r$)
                h = 60 * (((g$-b$)/cDelta) % 6);
            else if (cMax === g$)
                h = 60 * (((b$-r$)/cDelta) + 2);
            else if (cMax === b$)
                h = 60 * (((r$-g$)/cDelta) + 4);

            //sat
            if (l > 50)
                s = 100*(cDelta / (2 - maxAndMin));
            else
                s = 100*(cDelta / maxAndMin);
        }

        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        return packHSL(h,s,l);
    }

    /**
     * Converts from an HSL (hue, saturation, luminosity) format color to an RGB (red, 
     * green, blue) format color. Input ranges h between [0,260], s between 
     * [0, 100], and l between [0, 100], and output r, g, b ranges between [0,255]
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_rgb_to_hsl" block="%rgb"
    export function hslToRgb(hsl: number): number{
        //reference: https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSL
        let [h,s,l] = unpackHSL(hsl);
        let [s$, l$] = [s / 100, l / 100];
        let c = (1 - Math.abs(2*l$ - 1))*s$
        let h$ = h/60;
        let x = c*(1 - Math.abs(h$ % 2  - 1))
        let rgb$: [number, number, number];
        if (0 <= h$ && h$ < 1)
            rgb$ = [c,x,0]
        else if (1 <= h$ && h$ < 2)
            rgb$ = [x,c,0]
        else if (2 <= h$ && h$ < 3)
            rgb$ = [0,c,x]
        else if (3 <= h$ && h$ < 4)
            rgb$ = [0,x,c]
        else if (4 <= h$ && h$ < 5)
            rgb$ = [x,0,c]
        else if (5 <= h$ && h$ < 6)
            rgb$ = [c,0,x]
        else
            rgb$ = [0,0,0]
        let [r$,g$,b$] = rgb$;
        let m = l - 0.5*c;
        let [r,g,b] = [Math.round((r$+m)*255),Math.round((g$+m)*255),(Math.round(b$+m)*255)]
        return pack3(r,g,b);
    }
}