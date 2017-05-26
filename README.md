# NeoPixel driver

This library provides a driver for various Neo Pixel LED strips, 
see https://www.adafruit.com/category/168

NeoPixels consist of a number of RGB LEDs, every one of them controlled
separately.  

## Basic usage

```blocks
// Create a NeoPixel driver - specify the pin, number of LEDs, and the type of 
// the NeoPixel srip, either standard RGB (with GRB or RGB format) or RGB+White.
let strip = neopixel.create(DigitalPin.P0, 24, NeoPixelMode.RGB);

// set pixel colors
strip.setPixelColor(0, NeoPixelColors.White); // white
strip.setPixelColor(1, 0xff0000);     // red
strip.setPixelColor(2, 0x00ff00);     // green
strip.setPixelColor(3, NeoPixelColors.Blue);    // blue

// send the data to the strip
strip.show()
```

Use ``||setBrightness||`` to lower the brightness (it's maxed out by default).

Use ``||shift||`` or ``||rotate||`` to shift the lights around.

Use ``||setPixelWhiteLED||`` to set brightness of the white pixel for RGB+W strips. 

## HSL color format

Use `neopixel.hsl()` to create colors using hue, saturation, and lightness.

Use `.toRGB()` on an HSL color to convert it into RGB format. All colors passed to `strip.setPixelColor()`
or `strip.showColor` must be in RGB format.

For performance reasons, it is best to avoid making too many `.toRGB()` calls per second. For color 
animations, this can be avoided by only computing the set of colors in the animation once. See the HSL example below. 

## Example: Using accelerometer to control colors

This little program will let the position of the microbit control the color of the first LED.
This first LED will then get shifted further away every 100ms.

```blocks
let strip = neopixel.create(DigitalPin.P0, 24, NeoPixelMode.RGB_RGB)
while (true) {
    let x = input.acceleration(Dimension.X) / 2;
    let y = input.acceleration(Dimension.Y) / 2;
    let z = input.acceleration(Dimension.Z) / 2;
    strip.setPixelColor(0, neopixel.rgb(x, y, -z));
    strip.shift(1);
    strip.show();
    basic.pause(100);
}
```

## Example: Using HSL to produce a rainbow animation

This program uses HSL colors to display an animated rainbow pattern along the first 12 NeoPixels. 

```typescript
// setup
let stripLen = 12;
let np = neopixel.create(DigitalPin.P0, stripLen, NeoPixelMode.RGB)
np.setBrightness(10)

// compute colors in HSL, store colors in RGB
let colors: number[] = [];
let hStep = 360 / stripLen;
for (let i = 0; i < stripLen; i++) {
    let h = i * hStep;
    let hsl = neopixel.hsl(h, 100, 50);
    let rgb = hsl.toRGB();
    colors.push(rgb);
}

// set each pixel to a different color on the rainbow
for (let i = 0; i < stripLen; i++) {
    let clr = colors[i];
    np.setPixelColor(i, clr)
}

// animate the rainbow
while (true) {
    np.rotate(1);
    np.show();
    basic.pause(30)
}
```

## Supported targets

* for PXT/microbit

## License

MIT

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
