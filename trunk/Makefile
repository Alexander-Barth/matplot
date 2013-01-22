YUICOMPRESSOR=/home/abarth/Downloads/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar

SOURCE=demos/matplot.js

LICENCE_HEADER=admin/license_header
VERSION=0.1.1
TARGET=matplot-$(VERSION).js
TARGET_MIN=matplot-$(VERSION)-min.js


UPLOAD_DIR=gher-diva:/var/www/matplot/
#UPLOAD_DIR=localhost:/var/www/upload/matplot/

all: $(TARGET_MIN) demo


$(TARGET): $(SOURCE)
	cat $(SOURCE) > $(TARGET)

$(TARGET_MIN): $(TARGET)
	cp $(LICENCE_HEADER) $(TARGET_MIN)
	java -jar $(YUICOMPRESSOR) $(TARGET) >> $(TARGET_MIN)

demo:
	cd demos; python ./demo.py

clean:
	rm -f $(TARGET_MIN) $(TARGET)

tar: $(TARGET_MIN) $(TARGET)
	tar --exclude-vcs  --exclude=admin -cvzf ../matplot-$(VERSION).tar.gz .

upload: tar
	./admin/googlecode_upload.py -s "version $(VERSION) of matplot" -p matplot -u 'barth.alexander@gmail.com' -l "JavaScript,HTML,Visualization" ../matplot-$(VERSION).tar.gz

release: demo tar