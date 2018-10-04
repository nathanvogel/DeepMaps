import os
from options.test_options import TestOptions
from data import CreateDataLoader
from models import create_model
from util.visualizer import save_images
from util import html
from util import util
from PIL import Image
import ntpath


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


def getOldStyleImagePath():
    visuals = model.get_current_visuals()
    # Get image name
    img_path = model.get_image_paths()
    short_path = ntpath.basename(img_path[0])
    name = os.path.splitext(short_path)[0]

    for label, im_data in visuals.items():
        if label == 'fake_B':
            # Save path
            image_name = '%s_%s.png' % (name, label)
            save_path = os.path.join(".", image_name)
            print('saving image... %s' % (save_path))
            return save_path
    return None


if __name__ == '__main__':
    opt = TestOptions().parse()
    # hard-code some parameters for test
    opt.num_threads = 1   # test code only supports num_threads = 1
    opt.batch_size = 1    # test code only supports batch_size = 1
    opt.serial_batches = True  # no shuffle
    opt.no_flip = True    # no flip
    opt.display_id = -1   # no visdom display
    data_loader = CreateDataLoader(opt)
    dataset = data_loader.load_data()
    model = create_model(opt)
    model.setup(opt)
    # create a website
    # web_dir = os.path.join(opt.results_dir, opt.name, '%s_%s' % (opt.phase, opt.epoch))
    # webpage = html.HTML(web_dir, 'Experiment = %s, Phase = %s, Epoch = %s' % (opt.name, opt.phase, opt.epoch))
    # test with eval mode. This only affects layers like batchnorm and dropout.
    # pix2pix: we use batchnorm and dropout in the original pix2pix. You can experiment it with and without eval() mode.
    # CycleGAN: It should not affect CycleGAN as CycleGAN uses instancenorm without dropout.
    if opt.eval:
        model.eval()
    for i, data in enumerate(dataset):
        if i >= opt.num_test:
            break
        if i > 0:
            break
        image_pil = getOldStyleImage(data)
        save_path = getOldStyleImagePath()
        image_pil.save(save_path)

        # print(model.get_current_visuals());
        # print('processing (%04d)-th image... %s' % (i, visuals))
        # save_images(webpage, visuals, img_path, aspect_ratio=opt.aspect_ratio, width=opt.display_winsize)
    # save the website
    # webpage.save()
