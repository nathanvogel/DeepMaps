## Create your own dataset

Follow the instructions from CycleGAN.

### Input style

You can use my request-scraper extension inside /extensions.
For example: I gather more than 1'000 of them for my first training.

### Output style:

Gather a lot of images of the desired style.
For example: For my first training, I used a curation of 70 ancient hand-drawn high-resolution scans of maps, which, once cut into tiles, amounted to more than 4'000 tiles of 256x256 px.

Here're some commands that I used to prepare my dataset:

Make tiles from images:

```
convert *.jpg -shave 400x400 -crop 256x256 out/output_%d.jpg
```

Keep only files that match 256x256px resolution:

```
find . -name "*.jpg" -exec file "{}" \; | grep -v 256x256 | cut -d : -f 1 | xargs rm
```

or do both in one shot:

```
convert *.jpg -shave 400x400 -crop 256x256 out/output_%d.jpg && cd out && find . -name "*.jpg" -exec file "{}" \; | grep -v 256x256 | cut -d : -f 1 | xargs rm && cd ..
```
