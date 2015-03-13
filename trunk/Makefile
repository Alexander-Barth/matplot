YUICOMPRESSOR=$(HOME)/opt/yuicompressor-2.4.8.jar

SOURCE=demos/matplot.js

LICENCE_HEADER=admin/license_header
VERSION=0.1.3
TARGET=matplot-$(VERSION).js
TARGET_MIN=matplot-$(VERSION)-min.js

# temporary directory for SVN export
TMP=/tmp/matplot


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
	scp build/matplot-$(VERSION).tar.gz modb:/var/lib/mediawiki/upload/Alex/matplot
	ssh modb "cd /var/lib/mediawiki/upload/Alex/matplot; rm -f matplot.tar.gz; ln -s matplot-$(VERSION).tar.gz matplot.tar.gz"
jslint:
	jslint $(SOURCE)

release: demo tar