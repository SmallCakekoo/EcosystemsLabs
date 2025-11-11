#!/usr/bin/env python3
import sys
import json
import time
import warnings
from gpiozero import LED, RGBLED, Device

# Suprimir advertencias de pin factory
warnings.filterwarnings('ignore', category=RuntimeWarning)

# NO intentar usar pigpio - usar pin factory por defecto
print(json.dumps({'info': 'Usando pin factory por defecto'}), flush=True)

from luma.core.interface.serial import spi, noop
from luma.core.render import canvas
from luma.led_matrix.device import max7219
from PIL import Image
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# LEDs individuales
led_red = LED(17)
led_green = LED(27)
led_yellow = LED(22)

# LED RGB
rgb = RGBLED(red=18, green=13, blue=19)

# Matriz MAX7219
serial = spi(port=0, device=0, gpio=noop())
device = max7219(serial, cascaded=1, block_orientation=0, rotate=0)

# ADS1115 para sensores analógicos
try:
    i2c = busio.I2C(board.SCL, board.SDA)
    ads = ADS.ADS1115(i2c)
    
    # A0 = Fotocelda (LDR)
    # A1 = Potenciómetro
    ldr_channel = AnalogIn(ads, ADS.P0)
    pot_channel = AnalogIn(ads, ADS.P1)
    sensors_ok = True
    print(json.dumps({'info': 'ADS1115 inicializado correctamente'}), flush=True)
except Exception as e:
    sensors_ok = False
    ldr_channel = None
    pot_channel = None
    print(json.dumps({'warning': f'ADS1115 no disponible: {str(e)}'}), flush=True)

def control_led(color, state):
    """Control de LEDs individuales"""
    leds = {
        'red': led_red,
        'green': led_green,
        'yellow': led_yellow
    }
    if color in leds:
        if state:
            leds[color].on()
        else:
            leds[color].off()
        return True
    return False

def control_rgb(r, g, b):
    """Control del LED RGB con valores 0-255"""
    try:
        rgb.color = (r/255.0, g/255.0, b/255.0)
        return True
    except Exception as e:
        print(json.dumps({'error': f'RGB error: {str(e)}'}), flush=True)
        return False

def control_matrix(pattern):
    """Control de la matriz 8x8"""
    try:
        img = Image.new('1', (8, 8))
        pixels = img.load()
        
        for y in range(8):
            for x in range(8):
                if y < len(pattern) and x < len(pattern[y]):
                    pixels[x, y] = 1 if pattern[y][x] else 0
                else:
                    pixels[x, y] = 0
        
        device.display(img)
        return True
    except Exception as e:
        print(json.dumps({'error': f'Matrix error: {str(e)}'}), flush=True)
        return False

def read_sensors():
    """Lee los valores de los sensores analógicos"""
    if not sensors_ok:
        return {
            'potentiometer': 512,
            'light': 512,
            'error': 'Sensores no disponibles'
        }
    
    try:
        pot_raw = pot_channel.value
        ldr_raw = ldr_channel.value
        
        pot_value = int((pot_raw / 65535) * 1023)
        light_value = int((ldr_raw / 65535) * 1023)
        
        return {
            'potentiometer': pot_value,
            'light': light_value,
            'voltage_pot': round(pot_channel.voltage, 2),
            'voltage_ldr': round(ldr_channel.voltage, 2)
        }
    except Exception as e:
        return {
            'potentiometer': 512,
            'light': 512,
            'error': str(e)
        }

def clear_all():
    """Apaga todo"""
    led_red.off()
    led_green.off()
    led_yellow.off()
    rgb.off()
    device.clear()

def main():
    """Loop principal"""
    print(json.dumps({'status': 'ready', 'message': 'Sistema iniciado'}), flush=True)
    
    try:
        for line in sys.stdin:
            try:
                data = json.loads(line.strip())
                cmd = data.get('command')
                
                if cmd == 'led':
                    color = data.get('color')
                    state = data.get('state', False)
                    success = control_led(color, state)
                    print(json.dumps({
                        'status': 'ok' if success else 'error',
                        'command': 'led',
                        'color': color,
                        'state': state
                    }), flush=True)
                
                elif cmd == 'rgb':
                    r = data.get('r', 0)
                    g = data.get('g', 0)
                    b = data.get('b', 0)
                    success = control_rgb(r, g, b)
                    print(json.dumps({
                        'status': 'ok' if success else 'error',
                        'command': 'rgb',
                        'values': {'r': r, 'g': g, 'b': b}
                    }), flush=True)
                
                elif cmd == 'matrix':
                    pattern = data.get('pattern', [])
                    success = control_matrix(pattern)
                    print(json.dumps({
                        'status': 'ok' if success else 'error',
                        'command': 'matrix'
                    }), flush=True)
                
                elif cmd == 'read_sensors':
                    sensor_data = read_sensors()
                    print(json.dumps(sensor_data), flush=True)
                
                elif cmd == 'clear':
                    clear_all()
                    print(json.dumps({'status': 'ok', 'command': 'clear'}), flush=True)
                
                elif cmd == 'ping':
                    print(json.dumps({'status': 'pong'}), flush=True)
                
                else:
                    print(json.dumps({
                        'status': 'error',
                        'message': f'Comando desconocido: {cmd}'
                    }), flush=True)
                    
            except json.JSONDecodeError as e:
                print(json.dumps({
                    'status': 'error',
                    'message': f'JSON inválido: {str(e)}'
                }), flush=True)
            except Exception as e:
                print(json.dumps({
                    'status': 'error',
                    'message': str(e)
                }), flush=True)
    
    except KeyboardInterrupt:
        print(json.dumps({'status': 'interrupted'}), flush=True)
    finally:
        clear_all()
        led_red.close()
        led_green.close()
        led_yellow.close()
        rgb.close()

if __name__ == '__main__':
    main()