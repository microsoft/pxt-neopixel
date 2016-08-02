/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
    Red = 0xFF0000,
    Green = 0x00FF00,
    Blue = 0x0000FF,
    Yellow = 0xFFFF00,
    Purple = 0xFF00FF
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
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b). 
         * @param color RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="%strip|show color %color=neopixel_colors" 
        //% weight=85
        showColor(color: number) {
            let red = (color >> 16) & 0x0ff;
            let green = (color >> 8) & 0x0ff;
            let blue = (color) & 0x0ff;

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            let buf = this.buf;
            for (let i = this.start; i < this._length; ++i) {
                let ledoffset = i * 3;
                buf[ledoffset + 0] = green;
                buf[ledoffset + 1] = red;
                buf[ledoffset + 2] = blue;
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
        setPixelColor(ledoffset: number, color: number): void {
            if (ledoffset < this.start
                || ledoffset > this.start + this._length)
                return;

            ledoffset = (ledoffset + this.start) * 3;

            let red = (color >> 16) & 0x0ff;
            let green = (color >> 8) & 0x0ff;
            let blue = (color) & 0x0ff;

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
            this.brightness = brightness;
        }

        /** 
         * Create a range of LEDs.
         * @param start offset in the LED strip to start the range
         * @param length number of LEDs in the range. eg: 1
         */
        //% weight=89
        //% blockId="neopixel_range" block="%strip|range from %start|with %length|leds"
        range(start: number, length: number): Strip {
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + start;
            strip._length = length;
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
            this.buf.shift(-offset * 3)
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param off number of pixels to rotate forward, eg: 1
         */
        //% blockId="neopixel_rotate" block="%strip|rotate pixels by %offset" blockGap=8
        //% weight=39
        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * 3)
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
    //% blockId="neopixel_create" block="neopixel|at pin %pin|with %numleds|leds"
    //% weight=90 blockGap=8
    export function create(pin: DigitalPin, numleds: number): Strip {
        let strip = new Strip();
        strip.buf = pins.createBuffer(numleds * 3);
        strip.setBrigthness(255)
        strip.setPin(pin)
        strip.start = 0;
        strip._length = numleds;
        return strip;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="neopixel_color" block="red %red|green %green|blue %blue"
    export function color(red: number, green: number, blue: number): number {
        return ((red & 0x0ff) << 16) | ((green & 0x0ff) << 8) | (blue & 0x0ff);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    export function colors(color: NeoPixelColors): number {
        return color;
    }
}