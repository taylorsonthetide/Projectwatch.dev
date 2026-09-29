"""Original fictional coastal chart, using calculated Mercator coordinates.
No surveyed coastline or licensed chart image is reproduced. Training only.
"""
from pathlib import Path
import math, html, json
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/chartwork'
OUT.mkdir(exist_ok=True)
W,H=1600,1200
X,Y=75,145
LEFT,RIGHT=-4-20/60,-4
BOTTOM,TOP=50,50+10/60
def merc(lat): return math.log(math.tan(math.pi/4+math.radians(lat)/2))
S=1210/math.radians(RIGHT-LEFT)
PH=S*(merc(TOP)-merc(BOTTOM))
def xy(lat,lon): return X+S*math.radians(lon-LEFT),Y+S*(merc(TOP)-merc(lat))
def p(latmin,westmin): return xy(50+latmin/60,-4-westmin/60)
def text(x,y,t,size=16,fill='#26333a',anchor='start',extra=''):
 return f'<text x="{x:.2f}" y="{y:.2f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" {extra}>{html.escape(t)}</text>'
def poly(points,fill,stroke='#537680',width=1.4):
 pts=[p(a,b) for a,b in points];n=len(pts)
 path=f'M {pts[0][0]:.2f} {pts[0][1]:.2f}'
 for i in range(n):
  a,b,c,d=[pts[j%n] for j in (i-1,i,i+1,i+2)]
  path+=f' C {b[0]+(c[0]-a[0])/8:.2f} {b[1]+(c[1]-a[1])/8:.2f}, {c[0]-(d[0]-b[0])/8:.2f} {c[1]-(d[1]-b[1])/8:.2f}, {c[0]:.2f} {c[1]:.2f}'
 return f'<path d="{path} Z" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def line(a,b,color='#145e96',width=3,dash='',arrow=False):
 ax,ay=p(*a);bx,by=p(*b)
 return f'<line x1="{ax:.2f}" y1="{ay:.2f}" x2="{bx:.2f}" y2="{by:.2f}" stroke="{color}" stroke-width="{width}" '+(f'stroke-dasharray="{dash}" ' if dash else '')+(f'marker-end="url(#arrow)" ' if arrow else '')+'/>'
def dot(a,label,color='#126f98',shape='fix',dx=14,dy=-12):
 x,y=p(*a)
 s=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="8" fill="white" stroke="{color}" stroke-width="3"/>'
 if shape=='dr':s=f'<path d="M {x-9:.2f} {y+7:.2f} Q {x:.2f} {y-16:.2f} {x+9:.2f} {y+7:.2f}" fill="none" stroke="{color}" stroke-width="3"/>'
 if shape=='ep':s=f'<rect x="{x-7:.2f}" y="{y-7:.2f}" width="14" height="14" transform="rotate(45 {x:.2f} {y:.2f})" fill="white" stroke="{color}" stroke-width="3"/>'
 return s+text(x+dx,y+dy,label,18,color,extra='font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round"')
def callout(x,y,head,rows):
 s=f'<rect x="{x}" y="{y}" width="285" height="{65+len(rows)*26}" rx="9" fill="#fff" stroke="#b0c2c6"/>'+text(x+16,y+28,head,17,'#13546a',extra='font-weight="700"')
 for i,r in enumerate(rows):s+=text(x+16,y+58+i*26,r,15)
 return s
def base():
 s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200" role="img"><defs><clipPath id="panel"><rect x="{X}" y="{Y}" width="1210" height="{PH}"/></clipPath><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#167ca2"/></marker></defs><rect width="1600" height="1200" fill="#f4f1e7"/><g font-family="Arial,Helvetica,sans-serif">'''
 s+=text(75,51,'PROJECT WATCH • COASTAL TRAINING CHART',14,'#3f6470',extra='letter-spacing="2"')+text(75,90,'Alder Bay & East Island',34,'#173d4b',extra='font-weight="700"')
 s+=text(75,119,'PW–CW01  |  Fictional coast  |  Mercator  |  WGS 84  |  Depths in metres',16)
 s+=f'<rect x="{X}" y="{Y}" width="1210" height="{PH}" fill="#fbfaf5" stroke="#213b44" stroke-width="2"/><g clip-path="url(#panel)">'
 # Broad coastal depth bands. All depths and geography invented.
 s+=poly([(10,20),(10,0),(7.2,0),(7.1,5),(7.35,8),(7.3,12),(7.8,16),(6.2,17.3),(3,17.4),(0,16.7),(0,20)],'#e2f1f0','#78a1ae')
 s+=poly([(10,20),(10,0),(8,0),(8.05,4),(8.15,7.5),(7.85,10),(8.35,13),(8.35,16),(7.5,18),(4,18.2),(0,18),(0,20)],'#c4e5e9','#75a1ad')
 # Shoals: correctly labelled contour values; mainland below masks bands.
 s+=poly([(0.5,15.8),(0.3,12.5),(1.2,10.9),(2.7,11.8),(3.1,14),(2.7,16),(1.5,16.5)],'#e2f1f0','#79a4ae')
 s+=poly([(1,15),(0.85,13),(1.5,12),(2.5,12.7),(2.55,14.2),(1.9,15.4)],'#c4e5e9','#79a4ae')
 s+=poly([(2.9,5.6),(2.7,2.5),(3.2,1.6),(5.1,1.8),(5.7,3.7),(5.1,5.9),(4.1,6.4)],'#e2f1f0','#79a4ae')
 s+=poly([(3.3,5),(3.15,3),(3.7,2.35),(4.7,2.4),(5.2,3.6),(4.65,5.25),(4,5.6)],'#c4e5e9','#79a4ae')
 land=[(10,20),(10,0),(8.65,0),(8.7,3),(9,5),(8.8,6),(9.25,7.5),(9.4,9),(8.8,9.6),(8,10),(8.35,10.9),(8.9,11.4),(9.1,13),(8.95,15.3),(8.4,17.2),(7.3,18.2),(6.5,18.7),(5,19),(3.6,19.2),(2,19.1),(0,19.4),(0,20)]
 s+=poly(land,'#e7dba8','#3e5962',2)
 s+=poly([(6.85,17.2),(6.85,16.8),(7.15,16.75),(7.25,17.05)],'#e7dba8','#3e5962',2)
 s+=poly([(3.65,4.4),(3.6,3.3),(3.9,2.9),(4.5,3.2),(4.8,3.65),(4.5,4.3),(4,4.65)],'#e7dba8','#3e5962',2)
 # Terrain contours and roads provide familiar chart detail without cluttering sea.
 for i in range(3):s+=line((9.7-i*.1,17),(9.7-i*.1,2),'#aa9c73',1,'4 4')
 s+=line((9.1,17),(9.6,12),'#ae9d73',2)+line((9.6,12),(9.35,7),'#ae9d73',2)+line((9.35,7),(9.25,1),'#ae9d73',2)
 for a,b in [(9.2,13),(9.55,11.8),(9.48,12.4),(9.45,12.8),(9.15,5),(9.2,5.35)]:
  x,y=p(a,b);s+=f'<rect x="{x:.1f}" y="{y:.1f}" width="9" height="6" fill="#675d46"/>'
 # Harbour piers and clear IALA A port/starboard entry marks (entering northwards).
 s+=line((9.1,7.6),(8.55,7.6),'#3f4c50',7)+line((9.05,6.3),(8.55,6.3),'#3f4c50',7)
 for a,b,c,label in [(8.52,7.6,'#c72f48','Fl.R.4s'),(8.52,6.3,'#237648','Fl.G.4s')]:
  x,y=p(a,b);s+=f'<circle cx="{x}" cy="{y}" r="5" fill="{c}"/>'+text(x+8,y+15,label,13,c)
 for a,b,label in [(9.73,13,'ALDER COAST'),(9.45,4,'ALDER HARBOUR'),(4.45,3.7,'EAST'),(4.22,3.7,'ISLAND')]:
  x,y=p(a,b);s+=text(x,y,label,17,'#756441','middle',extra='letter-spacing="1.5"')
 # Soundings: deterministic non-surveyed illustrative values placed in open water.
 for a in [0.55,1.4,2.3,3.2,4.1,5,5.9,6.8,7.7]:
  for b in [1,2.6,4.2,5.8,7.4,9,10.6,12.2,13.8,15.4,17]:
   if a>6.5 or b>16 or (3<a<5.5 and 1.8<b<6.1) or (a<3.4 and 10.8<b<16.8) or (a<2.4 and b<4.8):continue
   # Central training lines remain readable.
   if abs(a-4)<.25 and 4<b<11:continue
   d=int(16+abs(math.sin(a*1.1+b*.8))*12)
   x,y=p(a,b);s+=text(x,y,str(d),15,'#34464e','middle')
 for a,b,t in [(2.1,13.5,'4.6'),(1.5,12.8,'3.8'),(1.2,14.4,'4.1'),(3.25,5,'6.4'),(5,3.7,'3.2'),(8.2,6.95,'3.8'),(7.75,7,'7.2'),(7.15,7,'19')]:
  x,y=p(a,b);s+=text(x,y,t,16,'#28434b','middle')
 for a,b,t in [(2.9,14.9,'10'),(2.6,12.4,'5'),(5.7,4,'10'),(7.3,14,'10'),(8.25,12,'5')]:
  x,y=p(a,b);s+=text(x,y,t,13,'#416a78',extra='font-style="italic"')
 x,y=p(1.6,13.7);s+=text(x,y+34,'ALDER BANK',16,'#547783','middle',extra='letter-spacing="2"')
 x,y=p(1.5,9);s+=text(x,y,'S',17,'#556c6e');x,y=p(6.4,14);s+=text(x,y,'M',17,'#556c6e')
 # A permanently submerged rock (cross); drying patch separately labelled in plain language.
 x,y=p(2.15,13.1);s+=f'<path d="M{x-5} {y}h10 M{x} {y-5}v10" stroke="#243b44" stroke-width="2"/>'+text(x+12,y,'Rock',13)
 s+=poly([(8.58,14.8),(8.45,14),(8.72,13.8),(8.9,14.6)],'#c9dc9c','#687c65')
 x,y=p(8.5,14.4);s+=text(x,y,'Drying 1.2m',12,'#3e5745','middle')
 # Surveyed-looking landmarks have exact fictional positions shared by all exercises.
 for a,b,name in [(8,10,'A • Alder Light'),(4,4,'B • East Light'),(7,17,'C • West Tower')]:
  x,y=p(a,b);s+=f'<circle cx="{x}" cy="{y}" r="4" fill="#202f35"/><path d="M{x} {y}l-22 -13" stroke="#ae4c84" stroke-width="4"/>'
  s+=text(x+10,y-12,name,15,'#633963',extra='paint-order="stroke" stroke="#f4f1e7" stroke-width="4"')
 # Nautical compass rose, exact calculated true degree marks.
 cx,cy=p(1.4,3.1)
 s+=f'<circle cx="{cx}" cy="{cy}" r="62" fill="none" stroke="#ae6b91" stroke-width="1"/>'
 for deg in range(0,360,5):
  rad=math.radians(deg);r=52 if deg%30==0 else 58
  s+=f'<line x1="{cx+r*math.sin(rad)}" y1="{cy-r*math.cos(rad)}" x2="{cx+62*math.sin(rad)}" y2="{cy-62*math.cos(rad)}" stroke="#ae6b91"/>'
 for deg,t in [(0,'N'),(90,'090'),(180,'180'),(270,'270')]:
  r=76;s+=text(cx+r*math.sin(math.radians(deg)),cy-r*math.cos(math.radians(deg))+5,t,13,'#9b5d81','middle')
 s+=text(cx,cy+5,'TRUE',11,'#9b5d81','middle')
 s+='</g>'
 # Graduated borders: minutes of latitude and longitude, not an arbitrary graphic grid.
 for i in range(11):
  x,y=p(i,20);s+=f'<line x1="{X-8}" y1="{y}" x2="{X+1210}" y2="{y}" stroke="#71909b" stroke-width="0.7" opacity=".28"/>'
  s+=text(X-14,y+5,f"{i:02d}′",13,anchor='end')+text(X+1219,y+5,f"{i:02d}′",13)
  for j in range(1,10):
   _,yy=p(i+j/10,20)
   if yy>=Y:s+=f'<path d="M{X} {yy}h{8 if j==5 else 4} M{X+1210} {yy}h{-8 if j==5 else -4}" stroke="#354d57"/>'
 for i in range(0,21,2):
  x,y=p(0,i);s+=f'<line x1="{x}" y1="{Y}" x2="{x}" y2="{Y+PH+8}" stroke="#71909b" stroke-width="0.7" opacity=".28"/>'
  s+=text(x,Y-10,f"{i:02d}′ W",13,anchor='middle')+text(x,Y+PH+24,f"{i:02d}′ W",13,anchor='middle')
 s+=text(X-14,Y-18,'50° N',13,anchor='end')+text(X,Y+PH+52,'Longitude 004° W • west minutes decrease to the right',14)
 s+=text(1340,150,'READ THIS CHART',18,'#173d4b',extra='font-weight="700"')
 s+=text(1340,179,'Training area only',16,'#925531',extra='font-weight="700"')
 rows=['All geography is fictional.','No surveyed depths.','Never use for navigation.','','Soundings: metres below','fictional chart datum.','','WGS 84 coordinates','Mercator projection','True north at the top','','S = sand  •  M = mud','Blue = shallower bands','Green = drying area','Buff = land']
 for i,r in enumerate(rows):s+=text(1340,211+i*24,r,15)
 s+=text(1340,616,'DISTANCE',16,'#173d4b',extra='font-weight="700"')
 # Reference latitude scale appropriate for this small extent.
 scale=S*(merc(50+5/60+1/60)-merc(50+5/60))
 for i in range(3):s+=f'<rect x="{1340+i*scale/2}" y="635" width="{scale/2}" height="9" fill="'+('#334f59' if i%2==0 else '#fff')+'" stroke="#334f59"/>'
 s+=text(1340,666,'0',13)+text(1340+scale,666,'1 NM',13,'#26333a','middle')+text(1340,692,'1′ latitude ≈ 1 NM',14)
 s+=text(1340,1120,'ORIGINAL PROJECT WATCH',12,'#57717b')+text(1340,1141,'Training chart PW–CW01 • v1',12,'#57717b')
 return s
P=(4,10);A=(8,10);B=(4,4);C=(7,17)
nm_lon=1/math.cos(math.radians(50+4/60))
D=(4,10-3*nm_lon);E=(5,10-3*nm_lon)
def footer(s,title,steps,overlay):
 s+=overlay+callout(1310,735,title,steps)
 s+=text(75,1164,'FICTIONAL TRAINING CHART — NOT FOR NAVIGATION',17,'#8a4c32',extra='font-weight="700" letter-spacing="1"')+'</g></svg>'
 return s
def guide(a,b,color='#126f98'):return line(a,b,color,2,'7 5')
plates={
 'overview':('One coast. Many skills.',['Find the harbour and lights.','Read the depths and hazards.','Use the border scales.'],''),
 'position':('Plot latitude, then longitude',["50°04.000′ N","004°10.000′ W",'The guides meet at P.'],guide((4,20),(4,0))+guide((0,10),(10,10))+dot(P,'P')),
 'distance':('Measure on latitude',['P to Q = 3.0 NM','Use the side latitude scale.','Keep the same chart scale.'],line(P,D,'#126f98',3)+dot(P,'P')+dot(D,'Q')+text(610,760,'3.0 NM',22,'#126f98')),
 'course':('Direction on the chart',['P to Q = 090° T','True north is at the top.','This is a planned track.'],line(P,D,'#167ca2',4,arrow=True)+dot(P,'P')+dot(D,'Q')+text(620,710,'090° T',22,'#126f98')),
 'fix':('Two bearings give two lines',['A bears 000° T','B bears 090° T','Lines meet at P.'],line((1,10),A,'#c04673',3,'8 4')+line((4,15),B,'#167ca2',3,'8 4')+dot(P,'P • visual fix')),
 'three':('Check with a third bearing',['A and B meet at P.','A third line checks the fix.','Real observations have error.'],line((1,10),A,'#c04673',3,'8 4')+line((4,15),B,'#167ca2',3,'8 4')+line(P,C,'#577933',3,'8 4')+dot(P,'P • idealised fix')),
 'dr':('Dead reckoning • 10:30',['10:00 start at P','090° T at 6 kn × 0.5 h','3.0 NM through water'],line(P,D,'#167ca2',4,arrow=True)+dot(P,'10:00 fix')+dot(D,'10:30 DR',shape='dr')),
 'ep':('Estimated position • 10:30',['DR: 3.0 NM east','Stream: 2 kn north × 0.5 h','Add 1.0 NM north to DR.'],line(P,D,'#167ca2',4,arrow=True)+line(D,E,'#167ca2',4,arrow=True)+line(P,E,'#9a5381',2,'6 6')+dot(P,'10:00 fix')+dot(D,'DR',shape='dr',dy=27)+dot(E,'10:30 EP',color='#9a5381',shape='ep')),
 'cts':('Aim into the current',['Desired track: 090° T','Speed through water: 6 kn','2 kn north → steer 109.5° T'],line(P,D,'#9a5381',3,'7 5')+line(P,(3,10-3*math.sqrt(8/9)*nm_lon),'#167ca2',4,arrow=True)+line((3,10-3*math.sqrt(8/9)*nm_lon),(4,10-3*math.sqrt(8/9)*nm_lon),'#167ca2',4,arrow=True)+dot(P,'Start')+text(620,820,'Through water',18,'#126f98')),
 'gps':('Transfer the GPS position',["50°04.000′ N","004°10.000′ W",'Check datum and format.'],guide((4,20),(4,0))+guide((0,10),(10,10))+dot(P,'GPS • check independently')),
 'pilotage':('Approach the harbour',['Use the larger-scale chart.','Check depth and tide.','Identify entry marks.'],line((6,7),(8.4,7),'#167ca2',3,'7 5',True)+dot((6,7),'Approach',dx=12,dy=27)),
}
for name,(title,steps,overlay) in plates.items():
 (OUT/f'{name}.svg').write_text(footer(base(),title,steps,overlay))
(OUT/'chart-metadata.json').write_text(json.dumps({'id':'PW-CW01','fictional':True,'navigationUse':False,'projection':'Mercator','datum':'WGS84','bounds':{'west':LEFT,'east':RIGHT,'south':BOTTOM,'north':TOP},'viewBox':[0,0,W,H],'panel':{'x':X,'y':Y,'width':1210,'height':PH},'points':{'P':P,'A':A,'B':B,'C':C,'DR':D,'EP':E},'license':'Original Project Watch artwork; no third-party chart or geography reproduced.'},indent=2))
print(f'Generated {len(plates)} calculated chart plates; chart panel height {PH:.3f}px')
