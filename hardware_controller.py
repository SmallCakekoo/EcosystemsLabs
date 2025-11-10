#!/usr/bin/env python3
import sys
import json
from gpiozero import LED, RGBLED, MCP3008
from luma.core.interface.serial import spi, noop
from luma.core.render import canvas
from luma.led_matrix.device import max7219
from time import sleep

# Configurar LEDs
led_red = LED(17)
led_green = LED(27)
led_yellow = LED(22)

# LED RGB
rgb = RGBLED(red=23, green=24, blue=25)

# Matriz MAX7219
serial = spi(port=0, device=0, gpio=noop())
device = max7219(serial, cascaded=1, block_orientation=0)

# Sensores analógicos (usando MCP3008)
pot = MCP3008(channel=0)  # Potenciómetro en canal 0
ldr = MCP3008(channel=1)  # Fotocelda en canal 1

def control_led(color, state):
    """Controla LEDs individuales"""
    leds = {'red': led_red, 'green': led_green, 'yellow': led_yellow}
    if color in leds:
        if state:
            leds[color].on()
        else:
            leds[color].off()

def control_rgb(r, g, b):
    """Controla LED RGB (valores 0-1)"""
    rgb.color = (r/255, g/255, b/255)

def control_matrix(pattern):
    """Muestra patrón en matriz 8x8"""
    with canvas(device) as draw:
        for y, row in enumerate(pattern):
            for x, pixel in enumerate(row):
                if pixel:
                    draw.point((x, y), fill="white")

def read_sensors():
    """Lee valores de sensores"""
    return {
        'potentiometer': pot.value * 1023,  # 0-1023
        'light': ldr.value * 1023
    }

def main():
    """Procesa comandos desde stdin (JSON)"""
    for line in sys.stdin:
        try:
            data = json.loads(line.strip())
            command = data.get('command')
            
            if command == 'led':
                control_led(data['color'], data['state'])
                print(json.dumps({'status': 'ok'}))
                
            elif command == 'rgb':
                control_rgb(data['r'], data['g'], data['b'])
                print(json.dumps({'status': 'ok'}))
                
            elif command == 'matrix':
                control_matrix(data['pattern'])
                print(json.dumps({'status': 'ok'}))
                
            elif command == 'read_sensors':
                sensors = read_sensors()
                print(json.dumps(sensors))
                
            sys.stdout.flush()
            
        except Exception as e:
            print(json.dumps({'error': str(e)}))
            sys.stdout.flush()

if __name__ == '__main__':
    try:
        main()
    finally:
        led_red.close()
        led_green.close()
        led_yellow.close()
        rgb.close()