import sys
from spleeter.separator import Separator

def separate_audio(input_path, output_path):
    separator = Separator('spleeter:2stems')
    separator.separate_to_file(input_path, output_path)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python spleeter_separation.py <input_path> <output_path>")
        sys.exit(1)
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    separate_audio(input_path, output_path)
