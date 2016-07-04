import picamera
from time import sleep


class CameraWrapper:

    # TODO: Use PiCamera.EXPOSURE_MODE values etc instead. More dynamic
    # Values exist for all 'modes' with more than on/off
    ALLOWED_VALUES = {
        'resolution': {'1080p', '720p', 'vga', 'auto'},
        'quality': range(10, 40),
        'bitrate': range(0, 25),
        'framerate': range(0, 90),
        'brightness': range(0, 100),
        'saturation': range(-100, 100),
        'sharpness': range(-100, 100),
        'contrast': range(-100, 100),
        'exposure_compensation': range(-25, 25),
        'iso': range(0, 800),
        'exposure_mode': {
            'auto', 'night', 'nightpreview', 'backlight', 'spotlight',
            'sports', 'snow', 'beach', 'verylong', 'fixedfps', 'antishake',
            'fireworks'},
        'awb_mode': {
            'auto', 'cloudy', 'shade', 'tungsten', 'fluorescent',
            'incandescent', 'flash', 'horizon', 'sunlight', 'off'},
        'video_stabilization': {'off', 'on'},
        'flash_mode': {
            'off', 'on', 'redeye', 'auto', 'fillin', 'torch'},
        'image_effect': {
            'none', 'negative', 'solarize', 'posterise', 'sketch',
            'denoise', 'emboss', 'oilpaint', 'hatch', 'gpen', 'pastel',
            'watercolor', 'film', 'saturation', 'colorswap', 'washedout',
            'colorpoint', 'colorbalance', 'cartoon'},
        'flip': {'none', 'vertical', 'horizontal', 'both'},
        'uchannel': range(0, 255),
        'ychannel': range(0, 255),
        'drc_strength': {'off', 'low', 'medium', 'high'},
        'meter_mode': {'average', 'spot', 'backlit', 'matrix'},
        'video_denoise': {'on', 'off'},
        'shutter_speed': range(0, 6000),
        'led': {'off', 'on'},
        'mutex': {'off', 'on'}
    }

    # Add these
    DEFAULT_SETTINGS = {

    }

    LOCKED_WHEN_RECORDING = {
        'resolution', 'quality', 'bitrate', 'framerate', 'drc_strength'
    }

    def __init__(self):
        self.camera = None

        # What to do about framerate? Depends on res
        self.startup_params = {
            'resolution': '1080p',
            'quality': 25,
            'bitrate': 17,
            'framerate': 30
        }

        self.settings = {
            'brightness': 50,
            'saturation': 0,
            'sharpness': 0,
            'contrast': 0,
            'exposure_compensation': 9,
            'iso': 0,
            'exposure_mode': 'auto',
            'awb_mode': 'auto',
            'video_stabilization': 'off',
            'flash_mode': 'off',
            'image_effect': 'none',
            'flip': 'none',
            'uchannel': 0,
            'ychannel': 0,
            'drc_strength': 'off',
            'meter_mode': 'average',
            'video_denoise': 'on',
            'shutter_speed': 0,
            'led': 'off',
            'mutex': 'off'
        }

    def start_recording(self, filename):
        # Nagon check om redan started/recording (olika saker) eller fanga err?
        # Om timelapse kommer den redan vara started. Men ej recording
        if(self.camera is None or self.camera.closed):
            # Apply settings innan objectet skapas
            self.camera = picamera.PiCamera(
                resolution=self.startup_params['resolution'],
                framerate=self.startup_params['framerate'])
            sleep(2)
            self.__setup_camera()
        if(self.camera.recording):
            return False
        try:
            btr = self.startup_params['bitrate'] * 1000000
            self.camera.start_recording(
                filename,
                quality=self.startup_params['quality'],
                bitrate=btr)
            return True
        # TODO: Better exception to catch here
        except picamera.PiCameraAlreadyRecording:
            return False

    def stop_recording(self):
        # TODO: Handle if no recording is active. Can happen if pressing
        # the record button several times when it is in loading state.
        self.camera.stop_recording()
        self.camera.close()
        return True

    def apply_setting(self, setting, value):
        # TODO: Take a param and place errror msg in this if return false?
        # TODO: Do error/range checking here or in private function?
        if(self.__is_integer(value)):
            value = int(value)

        # Invalid setting
        if(setting not in self.settings and
                setting not in self.startup_params):
            print "incorret setting"
            return False

        # Invalid value
        if value not in CameraWrapper.ALLOWED_VALUES[setting]:
            print "invalid value for " + setting
            return False

        if self.is_recording():
            if(setting in CameraWrapper.LOCKED_WHEN_RECORDING):
                print "already recording"
                return False
            else:
                success = self.__apply_setting_to_camera(setting, value)
                if not success:
                    print "not sucess"
                    return False

        if setting in self.startup_params:
            self.startup_params[setting] = value
        else:
            self.settings[setting] = value
        return True

    def __apply_setting_to_camera(self, setting, value):
        # TODO: Better name ....
        if setting == 'flip':
            if value == 'horizontal':
                setting = 'hflip'
                value = True
            elif value == 'vertical':
                setting = 'vflip'
                value = True
            elif value == 'both':
                setattr(self.camera, 'vflip', True)
                setattr(self.camera, 'hflip', True)
                return True
            elif value == 'none':
                setattr(self.camera, 'vflip', False)
                setattr(self.camera, 'hflip', False)
                return True
            else:
                # Use range check instead. (Allowed values)
                return False
        elif setting == 'uchannel' or setting == 'ychannel':
            # Do something
            return True
        elif setting == 'mutex':
            # DO something
            return True
        elif setting == 'led':
            # What to do about this? GPIO Library. Raises exception
            # Skicka vidare exception? To show user
            return True

        if(self.__is_integer(value)):
            value = int(value)
        # TODO: Try/catch atrributebute error etc
        setattr(self.camera, setting, value)
        return True

    def __setup_camera(self):
        for setting in self.settings:
            self.__apply_setting_to_camera(setting, self.settings[setting])

    def __is_integer(self, param):
        try:
            int(param)
        except ValueError:
            return False
        return True

    def is_recording(self):
        return self.camera is not None and self.camera.recording

    def get_settings(self):
        copy = dict(self.startup_params)
        copy.update(self.settings)
        copy['recording'] = self.is_recording()
        return copy

    def camera_status(self):
        if(self.camera is not None and not self.camera.closed):
            status = {
                'framerate': str(self.camera.framerate),
                'resolution': str(self.camera.resolution),
                'recording': str(self.camera.recording),
                'vflip': str(self.camera.vflip),
                'hflip': str(self.camera.hflip),
                'image-effects': str(self.camera.image_effect),
                'image_denoise': str(self.camera.image_denoise),
                'iso': str(self.camera.iso),
                'awb-mode': str(self.camera.awb_mode),
                'meter-mode': str(self.camera.meter_mode),
                'flash-mode': str(self.camera.flash_mode),
                'exposure_mode': str(self.camera.exposure_mode),
                'iso': str(self.camera.iso)
            }
        else:
            status = {'status': 'closed'}
        return status
