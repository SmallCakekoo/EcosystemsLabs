#!/usr/bin/env python3
import sys
import json
import time
import warnings

warnings.filterwarnings('ignore', category=RuntimeWarning)

from gpiozero import LED, PWMLED
from luma.core.interface.serial import spi, noop
from luma.led_matrix.device import max7219
from luma.core.render import canvas
from PIL import Image
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

print(json.dumps({'info': 'Iniciando sistema...'}), flush=True)

# -----------------------
# LEDs individuales
# -----------------------
try:
    led_red = LED(17)
    led_green = LED(27)
    led_yellow = LED(22)
    leds_ok = True
    print(json.dumps({'info': 'LEDs individuales OK'}), flush=True)
except Exception as e:
    leds_ok = False
    print(json.dumps({'error': f'LEDs: {str(e)}'}), flush=True)

# -----------------------
# LED RGB (ÁNODO COMÚN) - PWM
# Nota: por ánodo común, 0 = encendido, 1 = apagado
# -----------------------
try:
    # Si preferís pines sin PWM estable, usá LED en vez de PWMLED.
    rgb_red = PWMLED(18)
    rgb_green = PWMLED(13)
    rgb_blue = PWMLED(19)
    rgb_ok = True
    print(json.dumps({'info': 'LED RGB OK (PWM)'}), flush=True)
except Exception as e:
    rgb_ok = False
    print(json.dumps({'error': f'LED RGB: {str(e)}'}), flush=True)

# -----------------------
# Matriz MAX7219 8x8
# -----------------------
try:
    serial = spi(port=0, device=0, gpio=noop())
    device = max7219(serial, cascaded=1, block_orientation=0, rotate=0)
    device.clear()
    matrix_ok = True
    print(json.dumps({'info': 'Matriz 8x8 OK'}), flush=True)
except Exception as e:
    matrix_ok = False
    device = None
    print(json.dumps({'error': f'Matriz: {str(e)}'}), flush=True)

# -----------------------
# ADS1115 (A0 = LDR, A1 = Pot)
# -----------------------
try:
    i2c = busio.I2C(board.SCL, board.SDA)
    ads = ADS.ADS1115(i2c, address=0x48)
    ads.gain = 1  # ±4.096V típicamente

    # Usar índices de canal para compatibilidad con versiones modernas
    ldr_channel = AnalogIn(ads, 0)   # A0 -> Fotocelda
    pot_channel = AnalogIn(ads, 1)   # A1 -> Potenciómetro

    sensors_ok = True
    print(json.dumps({'info': 'ADS1115 OK en 0x48'}), flush=True)
except Exception as e:
    sensors_ok = False
    pot_channel = None
    ldr_channel = None
    print(json.dumps({'warning': f'ADS1115: {str(e)}'}), flush=True)

# -----------------------
# Funciones de control
# -----------------------
def control_led(color, state):
    """Control de LEDs individuales"""
    if not leds_ok:
        return False

    try:
        leds = {'red': led_red, 'green': led_green, 'yellow': led_yellow}
        if color in leds:
            if state:
                leds[color].on()
            else:
                leds[color].off()
            return True
        return False
    except Exception as e:
        print(json.dumps({'error': f'LED {color}: {str(e)}'}), flush=True)
        return False

def control_rgb(r, g, b):
    """
    Control del LED RGB (ánodo común).
    r,g,b esperados 0..255 (como en frontend).
    En ánodo común: led.value = 1 -> apagado, 0 -> encendido
    """
    if not rgb_ok:
        return False

    try:
        # Normalizar 0..1
        rn = min(max(float(r) / 255.0, 0.0), 1.0)
        gn = min(max(float(g) / 255.0, 0.0), 1.0)
        bn = min(max(float(b) / 255.0, 0.0), 1.0)

        # Invertir por ánodo común
        rgb_red.value = 1.0 - rn
        rgb_green.value = 1.0 - gn
        rgb_blue.value = 1.0 - bn
        return True
    except Exception as e:
        print(json.dumps({'error': f'RGB: {str(e)}'}), flush=True)
        return False

def control_matrix(pattern):
    """Dibuja una matriz 8x8 a partir de pattern (lista de filas)"""
    if not matrix_ok:
        return False

    try:
        # pattern: lista de filas, cada fila lista de 0/1 o falsy/truthy
        with canvas(device) as draw:
            for y in range(8):
                for x in range(8):
                    try:
                        on = False
                        if y < len(pattern) and x < len(pattern[y]):
                            on = bool(pattern[y][x])
                        if on:
                            draw.point((x, y), fill="white")
                    except Exception:
                        # si la fila no es válida, dejamos apagado
                        pass
        return True
    except Exception as e:
        print(json.dumps({'error': f'Matriz: {str(e)}'}), flush=True)
        return False

def read_sensors():
    """Leer sensores analógicos y devolver 0..1023 para cada uno"""
    if not sensors_ok:
        return {'potentiometer': 512, 'light': 512}

    try:
        # AnalogIn.value => 0..65535 (16-bit)
        pot_raw = pot_channel.value
        ldr_raw = ldr_channel.value

        pot_value = int((pot_raw / 23000.0) * 1023) if pot_raw is not None else 512
        light_value = int((ldr_raw / 65535.0) * 1023) if ldr_raw is not None else 512

        return {
            'potentiometer': pot_value,
            'light': light_value
        }
    except Exception as e:
        print(json.dumps({'error': f'Sensores: {str(e)}'}), flush=True)
        return {'potentiometer': 512, 'light': 512, 'error': str(e)}

def clear_all():
    """Apagar todo"""
    try:
        if leds_ok:
            led_red.off()
            led_green.off()
            led_yellow.off()
        if rgb_ok:
            rgb_red.off()
            rgb_green.off()
            rgb_blue.off()
        if matrix_ok:
            device.clear()
    except Exception as e:
        print(json.dumps({'error': f'Clear: {str(e)}'}), flush=True)

# -----------------------
# Loop principal
# -----------------------
def main():
    print(json.dumps({'status': 'ready', 'message': 'Sistema listo'}), flush=True)

    try:
        for line in sys.stdin:
            try:
                if not line:
                    continue
                data = json.loads(line.strip())
                cmd = data.get('command')

                if cmd == 'led':
                    color = data.get('color')
                    state = data.get('state', False)
                    success = control_led(color, state)
                    print(json.dumps({
                        'status': 'ok' if success else 'error',
                        'command': 'led'
                    }), flush=True)

                elif cmd == 'rgb':
                    r = data.get('r', 0)
                    g = data.get('g', 0)
                    b = data.get('b', 0)
                    success = control_rgb(r, g, b)
                    print(json.dumps({
                        'status': 'ok' if success else 'error',
                        'command': 'rgb'
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

            except json.JSONDecodeError:
                print(json.dumps({'status': 'error', 'message': 'JSON inválido'}), flush=True)
            except Exception as e:
                print(json.dumps({'status': 'error', 'message': str(e)}), flush=True)

    except KeyboardInterrupt:
        print(json.dumps({'status': 'interrupted'}), flush=True)
    finally:
        clear_all()
        # cerrar recursos gpio
        try:
            if leds_ok:
                led_red.close()
                led_green.close()
                led_yellow.close()
            if rgb_ok:
                rgb_red.close()
                rgb_green.close()
                rgb_blue.close()
        except Exception:
            pass
        print(json.dumps({'status': 'stopped'}), flush=True)

if __name__ == '__main__':
    main()
