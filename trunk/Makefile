YUICOMPRESSOR=/home/abarth/Downloads/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar

SOURCE=demos/matplot.js

LICENCE_HEADER=admin/license_header
VERSION=0.1.3
TARGET=matplot-$(VERSION).js
TARGET_MIN=matplot-$(VERSION)-min.js

# temporary directory for SVN export
TMP=/tmp/matplot

UPLOAD_DIR=gher-diva:/var/www/matplot/
#UPLOAD_DIR=localhost:/var/www/upload/matplot/

all: $(TARGET_MIN) demo


$(TARGET): $(SOURCE)
	cat $(SOURCE) > $(TARGET)

$(TARGET_MIN): $(TARGET) $(LICENCE_HEADER)
	cp $(LICENCE_HEADER) $(TARGET_MIN)
	java -jar $(YUICOMPRESSOR) $(TARGET) >> $(TARGET_MIN)

demo:
	cd demos; python ./demo.py

clean:
	rm -f $(TARGET_MIN) $(TARGET)

tar: $(TARGET_MIN) $(TARGET)
	rm -Rf $(TMP)
	svn export . $(TMP); 
	cp $(TARGET_MIN) $(TARGET) $(TMP)
	tar --exclude-vcs  --exclude=admin -C $(TMP) -cvzf build/matplot-$(VERSION).tar.gz .

upload: tar
	./admin/googlecode_upload.py -s "version $(VERSION) of matplot" -p matplot -u 'barth.alexander@gmail.com' -l "JavaScript,HTML,Visualization" build/matplot-$(VERSION).tar.gz

jslint:
	jslint $(SOURCE)

release: demo tar