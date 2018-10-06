from data.base_dataset import get_transform
from models import create_model
from util import util
from PIL import Image


dataset = None
model = None
mytransform = None


def getFakeImage(img):
    # Prepare file for Torch
    A_img = img.convert('RGB')
    A_img = mytransform(A_img)
    A_img = A_img.unsqueeze(0)

    # Format it like a dataset object, the only data that matters here is
    # 'A'.
    data = {
        'A': A_img,
        'B': A_img,
        'A_paths': "./tmpA.png",
        'B_paths': "./tmpB.png"
    }

    # Ask CycleGAN to generate the new image.
    image_pil = getOldStyleImage(data)
    return image_pil


def getOldStyleImage(data):
    model.set_input(data)
    model.test()
    visuals = model.get_current_visuals()

    for label, im_data in visuals.items():
        # Image data
        if label == 'fake_B':
            im = util.tensor2im(im_data)
            image_pil = Image.fromarray(im)
            return image_pil
    return None


def predictNewImage(data):
    model.real_A.resize_(model.real_A.size()).copy_(data)
    model.test()
    fake = util.tensor2im(model.fake_B.data)
    image_pil = Image.fromarray(fake)
    return image_pil


def setup(opt):
    # hard-code some parameters for test
    opt.num_threads = 1   # test code only supports num_threads = 1
    opt.batch_size = 1    # test code only supports batch_size = 1
    opt.serial_batches = True  # no shuffle
    opt.no_flip = True    # no flip
    opt.display_id = -1   # no visdom display

    # Setup the transform to send images into the neural network.
    global mytransform
    mytransform = get_transform(opt)

    # Setup the CycleGAN model.
    global model
    model = create_model(opt)
    model.setup(opt)

    if opt.eval:
        model.eval()
