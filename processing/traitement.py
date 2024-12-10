import sys, os
import pygame, colorsys
import csv, json
import time
from math import exp
from dataclasses import dataclass

@dataclass
class Image:
    name: str
    width: int
    height: int
    mean_hsv: tuple[float, float, float]
    max_hsv: tuple[float, float, float]
    gauss_hsv: tuple[float, float, float]

    def toDict(self):
        return {
            'name': self.name,
            'width': self.width,
            'height': self.height,
            'h_mean': self.mean_hsv[0],
            's_mean': self.mean_hsv[1],
            'v_mean': self.mean_hsv[2],
            'h_max': self.max_hsv[0],
            's_max': self.max_hsv[1],
            'v_max': self.max_hsv[2],
            'h_gauss': self.gauss_hsv[0],
            's_gauss': self.gauss_hsv[1],
            'v_gauss': self.gauss_hsv[2],
        }

def parse_args():
    i = 0
    N = -1
    while i < len(sys.argv):
        if sys.argv[i] == '-i':
            i += 1
            input_path = sys.argv[i]
        elif sys.argv[i] == '-o':
            i += 1
            output_path = sys.argv[i]
        elif sys.argv[i] == '-n':
            i += 1
            N = int(sys.argv[i])
        i += 1
    return input_path, output_path, N

def get_image_hsv_mean(image: pygame.Surface):
    """
    Calculate the average hue, saturation and value of an image
    """
    h_sum = 0.0
    s_sum = 0.0
    v_sum = 0.0
    for x in range(image.get_width()):
        for y in range(image.get_height()):
            r, g, b, _ = image.get_at((x, y))
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h_sum += h
            s_sum += s
            v_sum += v
    h = h_sum / (image.get_width() * image.get_height())
    s = s_sum / (image.get_width() * image.get_height())
    v = v_sum / (image.get_width() * image.get_height())
    return h, s, v

def get_image_hsv_discrete(image: pygame.Surface, N = 50):
    """
    Calculate the average hue, saturation and value of an image, by means of a discrete histogram
    """
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
    """
    Calculate the average hue, saturation and value of an image, by means of some sort of gaussian histogram
    """
    h_list = [0 for _ in range(N)]
    s_list = [0 for _ in range(N)]
    v_list = [0 for _ in range(N)]

    def add_gaussian(graph: list, x0: float, spread: float):
        def gaussian(i):
            x = i / len(graph)
            t = (x - x0) / spread
            graph[i] += exp(-t**2)
        [gaussian(i) for i in range(len(graph))]

    def add_gaussians(image, x, y):
        r, g, b, _ = image.get_at((x, y))
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        add_gaussian(h_list, h * N, 0.1)
        add_gaussian(s_list, s * N, 0.1)
        add_gaussian(v_list, v * N, 0.1)

    [[add_gaussians(image, x, y) for y in range(image.get_height())] for x in range(image.get_width())]
    
    h = h_list.index(max(h_list)) / N
    s = s_list.index(max(s_list)) / N
    v = v_list.index(max(v_list)) / N
    return h, s, v

def load_and_reduce_image(in_path, out_path):
    try:
        image = pygame.image.load(in_path)
    except Exception as e:
        return None, None

    width = image.get_width()
    height = image.get_height()
    aspect = width / height
    
    new_width = 128 if width > 128 else width
    new_height = int(new_width / aspect)

    # image = pygame.transform.scale(image, (new_width, new_height))
    if image.get_bitsize() >= 24:
        image = pygame.transform.smoothscale(image, (new_width, new_height))
    else:
        image = pygame.transform.scale(image, (new_width, new_height))
    pygame.image.save(image, out_path)

    name = out_path.split('/')[-1]
    return Image(name=name, width=width, height=height, mean_hsv=(0,0,0), max_hsv=(0,0,0), gauss_hsv=(0,0,0)), image
    # return Image(name=name, width=width, height=height, mean_hsv=(0,0,0), max_hsv=(0,0,0)), image


def calculate_hsv(image: Image, surf: pygame.Surface|None = None):
    if surf is None:
        loaded = pygame.image.load(output_dir + '/' + image.name)
    else:
        loaded = surf
    image.mean_hsv = get_image_hsv_mean(loaded)
    image.max_hsv = get_image_hsv_discrete(loaded, 360)
    image.gauss_hsv = get_image_hsv_continuous(loaded)
    return image

if __name__ == '__main__':
    input_dir, output_dir, N = parse_args()

    pygame.init()

    # Remove existing files from output directory
    for file in os.listdir(output_dir):
        os.remove(output_dir + '/' + file)

    first = time.time()
    data: list[Image] = []
    def process_image(file, i):
        global first
        delta = time.time()
        if delta - first > .5:
            print(f"Processing {i+1}/{len(dirs)}", end='\r')
            first = delta
        image, surf = load_and_reduce_image(input_dir + '/' + file, output_dir + '/' + file)
        if image == None:
            return
        image = calculate_hsv(image, surf)
        data.append(image)

    dirs = os.listdir(input_dir)
    [process_image(file, i) for i, file in enumerate(dirs[:N] if N > 0 else dirs)]
    print()

    with open(output_dir + '/../data.json', 'w') as f:
        json.dump([image.toDict() for image in data], f)

    with open(output_dir + '/../data.csv', 'w') as f:
        csv_writer = csv.writer(f)
        csv_writer.writerow(['name', 'width', 'height', 'h_mean', 's_mean', 'v_mean', 'h_max', 's_max', 'v_max', 'h_gauss', 's_gauss', 'v_gauss'])
        # csv_writer.writerow(['name', 'width', 'height', 'h_mean', 's_mean', 'v_mean', 'h_max', 's_max', 'v_max'])
        for image in data:
            h_mean, s_mean, v_mean = image.mean_hsv
            h_max, s_max, v_max = image.max_hsv
            h_gauss, s_gauss, v_gauss = image.gauss_hsv
            csv_writer.writerow([image.name, image.width, image.height, h_mean, s_mean, v_mean, h_max, s_max, v_max, h_gauss, s_gauss, v_gauss])
            # csv_writer.writerow([image.name, image.width, image.height, h_mean, s_mean, v_mean, h_max, s_max, v_max])
        
    pygame.quit()

