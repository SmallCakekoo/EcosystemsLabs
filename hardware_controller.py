#!/usr/bin/env python3
import sys
import json
from gpiozero import LED, RGBLED, MCP3008
from luma.core.interface.serial import spi, noop
from luma.core.render import canvas
from luma.led_matrix.device import max7219
from PIL import Image

# LEDs individuales
led_red = LED(17)
led_green = LED(27)
led_yellow = LED(22)

# LED RGB
rgb = RGBLED(red=23, green=24, blue=25)

# Matriz MAX7219
serial = spi(port=0, device=0, gpio=noop())
device = max7219(serial, cascaded=1, block_orientation=0, rotate=0)

# Sensores MCP3008
try:
    pot = MCP3008(channel=0)
    ldr = MCP3008(channel=1)
    sensors_ok = True
except:
    sensors_ok = False
    print(json.dumps({'warning': 'MCP3008 no disponible'}), flush=True)

def control_led(color, state):
    leds = {'red': led_red, 'green': led_green, 'yellow': led_yellow}
    if color in leds:
        leds[color].on() if state else leds[color].off()

def control_rgb(r, g, b):
    rgb.color = (r/255.0, g/255.0, b/255.0)

def control_matrix(pattern):
    img = Image.new('1', (8, 8))
    pixels = img.load()
    for y in range(8):
        for x in range(8):
            if y < len(pattern) and x < len(pattern[y]):
                pixels[x, y] = 1 if pattern[y][x] else 0
    device.display(img)

def read_sensors():
    if sensors_ok:
        return {
            'potentiometer': pot.value * 1023,
            'light': ldr.value * 1023
        }
    return {'potentiometer': 512, 'light': 512}

def main():
    print(json.dumps({'status': 'ready'}), flush=True)
    
    for line in sys.stdin:
        try:
            data = json.loads(line.strip())
            cmd = data.get('command')
            
            if cmd == 'led':
                control_led(data['color'], data['state'])
                print(json.dumps({'status': 'ok'}), flush=True)
            elif cmd == 'rgb':
                control_rgb(data['r'], data['g'], data['b'])
                print(json.dumps({'status': 'ok'}), flush=True)
            elif cmd == 'matrix':
                control_matrix(data['pattern'])
                print(json.dumps({'status': 'ok'}), flush=True)
            elif cmd == 'read_sensors':
                print(json.dumps(read_sensors()), flush=True)
        except Exception as e:
            print(json.dumps({'error': str(e)}), flush=True)

if __name__ == '__main__':
    try:
        main()
    finally:
        led_red.close()
        led_green.close()
        led_yellow.close()
        rgb.close()
        device.clear()