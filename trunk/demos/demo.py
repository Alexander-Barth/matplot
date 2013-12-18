#!/usr/bin/python
from Cheetah.Template import Template


version = '0.1.1';
namespace = {'matplot_lib': '../matplot-' + version + '.js', 
             'version': version, 
             'renderer': ''};


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
   <link href="../matplot.css" rel="stylesheet" type="text/css" />
   <script type="text/javascript" src="matplot.js"></script>
$head

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

    {'title': '1D plot',
     'description': 'Simple 1D line plots with different markers, anotation and legend (function plot)',
     'name': 'plot',
     'javascript': '''
 var i,x=[],y=[],z=[];

 for (i=0; i < 49; i++) {
   x[i] = i+3;
   y[i] = Math.sin(i/5);
   z[i] = Math.sin((i+3)/5);
 }
 
// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500$renderer);
ax = fig.axes();

// simple plot using indices as x-axis and values in parameter z as y-axis
// The curve is draw with the given color. The label will be used later in the legend
ax.plot(z,{color: 'red', label: 'foo'});
      
// define marker and marker size
ax.plot(y,{color: 'blue', marker: 'o', markerSize: 5, label: 'bar'});
 
// make a dotted line with linespec
ax.plot(x,y,{color: 'green', marker: 's', linewidth: 2, label: 'baz'});

// add legend
ax.legend();

// add annotation at the location x=20, y=0.6 and z=0 with the given text
ax.annotation(20,0.6,0,'annotation');

// draw everything
fig.draw();
'''},

#############################
    {'title': 'pcolor',
     'description': '2D pseudo color plot (function pcolor)',
     'name': 'peaks',
     'javascript': '''
// load the peaks sample data
peaks = matplot.peaks();

// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500$renderer);

// add axis to the figure
ax = fig.axes();

// pseudo color plot
ax.pcolor(peaks.x,peaks.y,peaks.z);

// add color-bar
ax.colorbar();

// draw everything
fig.draw();
'''},

#############################
    {'title': 'patch',
     'description': 'Draw a polygone (function patch)',
     'name': 'patch',
     'javascript': '''
// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500$renderer);

// add axis to the figure
ax = fig.axes();

// blue triangle
ax.patch([0,2,1],[0,0,1],{color: 'blue'});

// draw everything
fig.draw();
'''},


#############################
    {'title': 'coastline',
     'description': 'Example showing the coastline (function patch)',
     'name': 'countries',
     'head': '<script type="text/javascript" src="countries.js"></script>',
     'javascript': '''
// the global variable 'countries' is loaded from the file countries.js
var i,j, coord;  


// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500$renderer);

// add axis to the figure
ax = fig.axes();

// loop over all countries and polygones
for (i=0; i < countries.length; i++) {
  for (j=0; j < countries[i].coordinates.length; j++) {
    // countries[i].coordinates[j] is a list of [longitude,latitude]
    coord = numeric.transpose(countries[i].coordinates[j]);
    ax.patch(coord[0],coord[1],{color: 'blue'});
  }
}

// draw everything
fig.draw();
'''},


#############################

    {'title': 'pcolor on non-rectangular grid',
     'description': '2D pseudo color plot on non-rectangular grid (function pcolor)',
     'name': 'pcolor',
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

fig = new matplot.Figure("plot",700,500$renderer);
ax = fig.axes();
ax.pcolor(x,y,z);
ax.colorbar();
ax.DataAspectRatio([1,1,1]);
fig.draw();

'''},

#############################

     {'title': 'quiver',
      'description': 'Arrow plot (function quiver)',
      'name': 'quiver',
      'javascript': '''
var i,j,x=[],y=[],u=[], v=[];
  
// generate some data to plot
for (i=0; i < 30; i++) {
  x[i] = [];
  y[i] = [];
  u[i] = [];
  v[i] = [];

  for (j=0; j < 30; j++) {
    x[i][j] = i-15
    y[i][j] = j-15
    u[i][j] = -y[i][j]
    v[i][j] = x[i][j]
  }
}

fig = new matplot.Figure("plot",700,500$renderer);
ax = fig.axes();
//ax.quiver(x,y,u,v,{scale: 0.1,color: 'green'});
ax.quiver(x,y,u,v,{scale: 0.1,color: 'norm'});
ax.DataAspectRatio([1,1,1]);
ax.colorbar();

fig.draw();
'''},


    {'title': 'scatter',
     'description': '2D scatter plot (function scatter)',
     'name': 'scatter',
     'javascript': '''
var i,x=[],y=[],c=[];
  

// generate some data to plot
// generate some data to plot
for (i=0; i < 100; i++) {

    r = 20 + 5*i;
    theta = 2*Math.PI * i/25;
    x[i] = r*Math.cos(theta);
    y[i] = r*Math.sin(theta);
    c[i] = r;
  
}

fig = new matplot.Figure("plot",700,500$renderer);
ax = fig.axes();
ax.scatter(x,y,5,c);
ax.DataAspectRatio([1,1,1]);
ax.colorbar();

fig.draw();
'''},

#############################

    {'title': 'Surface plot',
     'description': '3D pseudo color plot (function surf)',
     'name': 'surf',
     'javascript': '''
// load the peaks sample data
peaks = matplot.peaks();

// make a figure of size 700 x 500 pixels
fig = new matplot.Figure("plot",700,500);

// add axis to the figure
ax = fig.axes();

// pseudo color plot
ax.surf(peaks.x,peaks.y,peaks.z);

//ax.CameraPosition([27.394,  35.701,   25.981]);

// add color-bar
ax.colorbar();

// draw everything
fig.draw();
'''},

#############################

    {'title': '3D scatter',
     'description': '3D scatter plot (function scatter3)',
     'name': 'scatter3',
     'javascript': '''

var i, j, k, x = [],y = [], z = [], c = [], r = [];


// generate some data to plot
for (i=0; i < 4; i++) {
  x[i] = [];
  y[i] = [];
  z[i] = [];
  c[i] = [];

  for (j=0; j < 20; j++) {
    x[i][j] = [];
    y[i][j] = [];
    z[i][j] = [];
    c[i][j] = [];
                
    for (k=0; k < 10; k++) {
      r = 20 + 5*i;
      phi = 2*Math.PI * j/19;
      theta = Math.PI * k/9;

      phi = 2*Math.PI * j/9;
      theta = Math.PI * k/4;

      x[i][j][k] = r * Math.sin(theta) * Math.cos(phi);
      y[i][j][k] = r * Math.sin(theta) * Math.sin(phi);
      z[i][j][k] = r * Math.cos(theta);  
      c[i][j][k] = r;
    }
  }
}


fig = new matplot.Figure("plot",700,500);
ax = fig.axes();
ax.scatter3(x,y,z,5,c);
ax.DataAspectRatio([1,1,1]);
ax.colorbar();

ax.CameraPosition([100,  100,   40]);

fig.draw();
'''},

#############################

#     {'title': 'pcolor',
#      'description': '2D pseudo color plot',
#      'name': 'pcolor',
#      'javascript': '''
# '''},


]

# template for index file

index = '''
<!DOCTYPE html>
<html>
 <head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="keywords" content="visualization, demo, JavaScript, web-app, education">
    <meta name="author" content="Alexander Barth">
    <title>matplot: demo</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
 </head>
    <h1>matplot</h1>
    <ul>
$example
    </ul>      
  </body>
</html>
'''
def makeDemos(demos):
    example = []

    for demo in demos:
        if 'head' not in demo:
            demo['head'] = ''
    
        example += ['<li>' + demo['description']]
 
        for renderer in ['','matplot.RasterCanvas']:

            print 'Making example:',demo['title']
            if renderer == 'matplot.RasterCanvas':
                rtype = 'canvas'
                filename = 'demo_' + demo['name'] + '_canvas' + '.html'
                namespace['renderer'] = ', {renderer: ' + renderer + '}'
            else:
                rtype = 'svg'
                filename = 'demo_' + demo['name'] + '.html'
                namespace['renderer'] = ''

            example += [' <a href="',filename,'">',rtype,'</a> ']
    
            javascript = demo['javascript']
            
            f = open(filename,'w')
            f.write(str(Template(templateDef, searchList=[
                            {'javascript': javascript.replace('$renderer',namespace['renderer'])},
                            demo,namespace])))
            f.close();

        example += ['</li>']

    f = open('index.html','w')
    f.write(str(Template(index, searchList={'example': ''.join(example)})))
    f.close();
    

if __name__ == '__main__':
    makeDemos(demos)

