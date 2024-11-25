import sys, os
import pygame, colorsys
import csv, json
from dataclasses import dataclass

@dataclass
class Image:
    name: str
    width: int
    height: int
    h: int
    s: int
    v: int

    def toDict(self):
        return {
            'name': self.name,
            'width': self.width,
            'height': self.height,
            'h': self.h,
            's': self.s,
            'v': self.v
        }

def parse_args():
    i = 0
    while i < len(sys.argv):
        if sys.argv[i] == '-i':
            i += 1
            input_path = sys.argv[i]
        elif sys.argv[i] == '-o':
            i += 1
            output_path = sys.argv[i]
        i += 1
    return input_path, output_path

def get_image_hsv_discrete(image: pygame.Surface, N = 50):
    h_list = [0 for i in range(N+1)]
    s_list = [0 for i in range(N+1)]
    v_list = [0 for i in range(N+1)]
    for x in range(image.get_width()):
        for y in range(image.get_height()):
            r, g, b, _ = image.get_at((x, y))
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h_list[int(h * N)] += 1
            s_list[int(s * N)] += 1
            v_list[int(v * N)] += 1
    h = h_list.index(max(h_list)) / N
    s = s_list.index(max(s_list)) / N
    v = v_list.index(max(v_list)) / N
    return h, s, v

def get_image_hsv_continuous(image: pygame.Surface, N = 360):
    # same as discrete, but plot a gaussian curve for each hsv reading

    pass

def process_image(in_path, out_path):
    try:
        image = pygame.image.load(in_path)
    except Exception as e:
        print(in_path, e)
        return None

    width = image.get_width()
    height = image.get_height()
    aspect = width / height

    new_width = 128 if width > 128 else width
    new_height = int(new_width / aspect)

    image = pygame.transform.scale(image, (new_width, new_height))
    pygame.image.save(image, out_path)

    h, s, v = get_image_hsv_discrete(image)

    name = out_path.split('/')[-1]
    return Image(name=name, width=width, height=height, h=h, s=s, v=v)

input_dir, output_dir = parse_args()

pygame.init()

for file in os.listdir(output_dir):
    os.remove(output_dir + '/' + file)

data: list[Image] = []

for file in os.listdir(input_dir):
    image = process_image(input_dir + '/' + file, output_dir + '/' + file)
    if image != None:
        data.append(image)

with open(output_dir + '/../data.json', 'w') as f:
    json.dump([image.toDict() for image in data], f)

with open(output_dir + '/../data.csv', 'w') as f:
    csv_writer = csv.writer(f)
    csv_writer.writerow(['name', 'width', 'height', 'h', 's', 'v'])
    for image in data:
        csv_writer.writerow([image.name, image.width, image.height, image.h, image.s, image.v])
    
pygame.quit()

