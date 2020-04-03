import cv2
import os
import datetime
import numpy
from engine.core.logger import info

# Get frames from LAN camera and save as video or separated frames
class Recorder:

    # Class constructor
    def __init__(self, path, spot, position, config = {'fps': 25,  'width' : 640, 'height': 480}):
        # set path for saving
        self.path = path
        # setup video recorder
        self.fps = config.get('fps')
        self.width = config.get('width')
        self.height = config.get('height')
        # set codec for video saver
        self.fourcc = cv2.VideoWriter_fourcc(*'XVID')
        # set spot and position
        self.spot = spot
        self.position = position
        # set frames array and skip frames to 0
        self.frames = []
        self.pack_size = 10
        self.min_pack_size = 256
        self.skip_frame = 0
        self.pack_skip_frame = 0

    # video stream recorder
    def video(self):
        self.video_dir = self.path + '/data/video/spot_' + str(self.spot) + '/' + str(datetime.datetime.today().strftime('%d-%m-%Y')) + '/'
        if not os.path.exists(self.video_dir): os.makedirs(self.video_dir)

        video_filepath  = self.video_dir + str(self.position) + '_camera_' + str(datetime.datetime.today().strftime('%d-%m-%Y_%H_%M_%S')) + '.avi'
        self.out_stream = cv2.VideoWriter(video_filepath, self.fourcc, self.fps, (self.width, self.height))
        return video_filepath

    # write video
    def record(self, frame):
        self.out_stream.write(frame)

    # stop video writer
    def stop(self):
        self.out_stream.release()

    # save frame
    def save(self, frame, folder = 'frames'):
        self.frame_dir = self.path + '/data/images/'+ folder +'/spot_' + str(self.spot) + '/' + str(datetime.datetime.today().strftime('%d-%m-%Y')) + '/'
        if not os.path.exists(self.frame_dir): os.makedirs(self.frame_dir)
        framepath = self.frame_dir + str(datetime.datetime.today().strftime('%d-%m-%Y_%H_%M_%S_%f')) + '.png'
        cv2.imwrite(framepath, frame)

    # save all frames
    def frame(self, image, skip = 1):
        if self.skip_frame < skip:
            self.skip_frame += 1
        else:
            self.save(image)
            self.skip_frame = 0

    def render(self):
        if len(self.frames) >= self.min_pack_size:
            frames = self.frames
            self.frames = []
            n = 1
            while(n * n <= len(frames)):
                n += 1

            self.pack_size = n

            packed = numpy.zeros((120 * self.pack_size, 160 * self.pack_size, 3))
            n = 0
            for yi in range(self.pack_size):
                for xi in range(self.pack_size):
                    if len(frames) >= (n + 1):
                        item = frames[n]
                    else:
                        item = numpy.zeros((120, 160, 3))
                    temp = cv2.resize(item, (160,120))
                    packed[yi*120:(yi+1)*120, xi*160:(xi+1)*160, :] = temp[:,:,:]
                    n += 1

            self.save(packed, 'packs')
            self.pack_skip_frame = 0

    # save packed frames
    def pack(self, image, skip = 3):
        if self.pack_skip_frame < skip:
            self.pack_skip_frame += 1
        else:
            self.frames.append(image)
            self.pack_skip_frame = 0
            info("Count of frames: " + str(len(self.frames)))

