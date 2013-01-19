#!/usr/bin/python
from Cheetah.Template import Template


version = '0.1.1';
namespace = {'matplot_lib': '../matplot-' + version + '.js', 'version': version};


templateDef='''
<!DOCTYPE html>
<html>
 <head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   <meta name="author" content="Alexander Barth">

   <title>matplot: $title</title>
   <link href="style.css" rel="stylesheet" type="text/css" />
   <link href="prettify/prettify.css" type="text/css" rel="stylesheet" />
   <script type="text/javascript" src="prettify/prettify.js"></script>
   <script type="text/javascript" src="numeric-1.2.3.js"></script>
   <link href="matplot.css" rel="stylesheet" type="text/css" />
   <script type="text/javascript" src="matplot.js"></script>

   <script type="text/javascript">
function init() {      
  $javascript
}

addEventListener('load', function (event) { prettyPrint() }, false);

    </script>
 </head>
    <body onload="init()">
    <h1>matplot: $title</h1>
    <p>$description</p>
    <div id="plot"></div>
    <h2>Code:</h2>
    <pre class=prettyprint>
$javascript
    </pre>    
  </body>
</html>
'''

demos = [

# DEMO 1

    {'title': 'Plot',
     'description': 'Simple 1D line plots with different markers, anotation and legend',
     'name': 'example1',
     'javascript': '''
 var i,x=[],y=[],z=[];

 for (i=0; i < 49; i++) {
   x[i] = i+3;
   y[i] = Math.sin(i/5);
   z[i] = Math.sin((i+3)/5);
 }
 
// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500);
ax = fig.axes(0.1,0.1,.72,.8);

// simple plot using indices as x-axis and values in parameter z as y-axis
// The curve is draw with the given color. The label will be used later in the legend
ax.plot(z,{color: 'red', label: 'foo'});
      
// define marker and marker size
ax.plot(y,{color: 'blue', marker: 'o', markersize: 5, label: 'bar'});
 
// make a dotted line with linespec
ax.plot(x,y,{color: 'green', marker: 's', linewidth: 2, label: 'baz'});

// add legend
ax.legend();

// add annotation at the location x=20, y=0.6 and z=0 with the given text
ax.annotation(20,0.6,0,'annotation');

// draw everything
fig.draw();
'''},

    {'title': 'pcolor',
     'description': '2D pseudo color plot',
     'name': 'pcolor',
     'javascript': '''
// load the peaks sample data
peaks = matplot.peaks();

// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500);

// add axis to the figure
ax = fig.axes(0.1,0.1,.72,.8);

// pseudo color plot
ax.pcolor(peaks.x,peaks.y,peaks.z);

// add color-bar
ax.colorbar();

// draw everything
fig.draw();
'''},

    {'title': 'pcolor on non-rectangular grid',
     'description': '2D pseudo color plot on non-rectangular grid',
     'name': 'pcolor-non-rect',
     'javascript': '''
var i,j,x=[],y=[],z=[], r, theta;

// generate some data to plot
for (i=0; i < 100; i++) {
        x[i] = [];
        y[i] = [];
        z[i] = [];

        for (j=0; j < 100; j++) {
            r = 20 + i;
            theta = 2*Math.PI * j/99;
            x[i][j] = r*Math.cos(theta);
            y[i][j] = r*Math.sin(theta);
            z[i][j] = Math.cos(2*theta);
        }
    }


        fig = new matplot.Figure("plot",700,500);
        ax = fig.axes(0.1,0.1,.72,.8);
        ax.pcolor(x,y,z);
        ax.colorbar();
        ax.DataAspectRatio([1,1,1]);
        fig.draw();

'''},
    {'title': 'surface plot',
     'description': '3D pseudo color plot',
     'name': 'surface',
     'javascript': '''
// load the peaks sample data
peaks = matplot.peaks();

// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500);

// add axis to the figure
ax = fig.axes(0.1,0.1,.72,.8);

// pseudo color plot
ax.surf(peaks.x,peaks.y,peaks.z);

ax.CameraPosition([27.394,  35.701,   25.981]);

// add color-bar
ax.colorbar();

// draw everything
fig.draw();
'''},


#     {'title': 'pcolor',
#      'description': '2D pseudo color plot',
#      'name': 'pcolor',
#      'javascript': '''
# '''},


]


def makeDemos(demos):
    for demo in demos:
        print 'Making example:',demo['title']
        filename = 'example_' + demo['name'] + '.html'
        f = open(filename,'w')
        f.write(str(Template(templateDef, searchList=[demo,namespace])))
        f.close();

    

if __name__ == '__main__':
    makeDemos(demos)

