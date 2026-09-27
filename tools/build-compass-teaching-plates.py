"""Render exact geometry for the compass lessons' two technical plates."""
from math import radians, sin, cos
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT=Path(__file__).resolve().parents[1]/'assets/compass/scenes'
S=2; W=1600; H=900
NAVY='#123c5c'; TEAL='#177889'; GOLD='#bd762e'; INK='#173a55'
def font(n,b=False):return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/'+('DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),n*S)
def pos(pt):return tuple(round(x*S) for x in pt)
def new(title,sub):
    im=Image.new('RGB',(W*S,H*S),'#f6f9fa');d=ImageDraw.Draw(im)
    d.rounded_rectangle((20*S,20*S,1580*S,880*S),radius=26*S,fill='white',outline='#c4d8e2',width=2*S)
    d.rounded_rectangle((20*S,20*S,1580*S,122*S),radius=26*S,fill=NAVY)
    d.rectangle((20*S,80*S,1580*S,122*S),fill=NAVY)
    d.text(pos((58,51)),title,font=font(30,True),fill='white')
    d.text(pos((58,142)),sub,font=font(19),fill='#456b80')
    return im,d
def txt(d,x,y,s,n=20,c=INK,b=False,anchor='la'):d.text(pos((x,y)),s,font=font(n,b),fill=c,anchor=anchor)
def line(d,pts,c=TEAL,w=3):d.line([pos(p) for p in pts],fill=c,width=w*S,joint='curve')
def arrow(d,a,b,c,w=9):
    line(d,[a,b],c,w)
    dx=b[0]-a[0];dy=b[1]-a[1];length=(dx*dx+dy*dy)**.5
    ux,uy=dx/length,dy/length;vx,vy=-uy,ux
    d.polygon([pos(b),pos((b[0]-ux*25+vx*12,b[1]-uy*25+vy*12)),pos((b[0]-ux*25-vx*12,b[1]-uy*25-vy*12))],fill=c)
def pill(d,x,y,w,s,c='#ecf5f8'):
    d.rounded_rectangle((x*S,y*S,(x+w)*S,(y+53)*S),radius=13*S,fill=c,outline='#bdd4e0',width=2*S)
    txt(d,x+18,y+26,s,19,NAVY,True,'lm')
def save(im,name):
    OUT.mkdir(parents=True,exist_ok=True)
    im.resize((W,H),Image.Resampling.LANCZOS).save(OUT/name,optimize=True)

im,d=new('TRUE NORTH AND MAGNETIC NORTH','Variation is the angle between the two references at a particular place and date.')
# Map-like graticule is deliberately faint; the example magnetic direction is
# 15° east of true, drawn from a common origin using exact trig.
for x in range(300,1310,125):line(d,[(x,208),(x,764)],'#e4edf1',1)
for y in range(225,775,110):line(d,[(288,y),(1320,y)],'#e4edf1',1)
O=(720,681);r=365
d.ellipse((O[0]*S-9*S,O[1]*S-9*S,O[0]*S+9*S,O[1]*S+9*S),fill=NAVY)
arrow(d,O,(O[0],O[1]-r),NAVY,10)
angle=15
M=(O[0]+sin(radians(angle))*r,O[1]-cos(radians(angle))*r)
arrow(d,O,M,GOLD,10)
arc=[(O[0]+sin(radians(a))*96,O[1]-cos(radians(a))*96) for a in range(0,angle+1)]
line(d,arc,GOLD,4)
txt(d,615,282,'TRUE NORTH',20,NAVY,True)
txt(d,832,307,'MAGNETIC NORTH',20,GOLD,True)
pill(d,955,488,352,'VARIATION: EXAMPLE 15° E')
txt(d,971,568,'Actual variation must come from',19)
txt(d,971,599,'current chart information for',19)
txt(d,971,630,'your position and date.',19)
txt(d,58,840,'T = chart reference     •     M = Earth-field reference     •     this angle is illustrative',18,'#496c80')
save(im,'north-reference-accurate.png')

im,d=new('PLOT A BEARING ON THE CHART','The reciprocal line runs 180° opposite the direction from boat to lighthouse.')
for x in range(110,1510,96):line(d,[(x,208),(x,748)],'#e3edf1',1)
for y in range(228,760,96):line(d,[(90,y),(1506,y)],'#e3edf1',1)
# With north vertically up, equal east and north components make exactly 045°.
B=(590,684);L=(1024,250)
line(d,[B,L],'#bfd8df',9)
arrow(d,(694,580),(820,454),GOLD,10)
arrow(d,(947,327),(823,451),TEAL,10)
for p,c in [(B,TEAL),(L,GOLD)]:
    x,y=p;d.ellipse(((x-13)*S,(y-13)*S,(x+13)*S,(y+13)*S),fill='white',outline=c,width=5*S)
# True north is the common chart grid reference. Short north lines demonstrate
# that 045° / 225° are directional bearings, not an arbitrary screen diagonal.
arrow(d,(585,455),(585,325),NAVY,4)
txt(d,585,300,'N',21,NAVY,True,'mm')
arrow(d,(1018,523),(1018,393),NAVY,4)
txt(d,1018,367,'N',21,NAVY,True,'mm')
pill(d,193,466,323,'BOAT → LIGHT: 045° T')
pill(d,1060,456,350,'LIGHT → BOAT: 225° T')
txt(d,504,733,'BOAT',21,TEAL,True)
txt(d,1039,261,'LIGHTHOUSE',21,GOLD,True)
d.rounded_rectangle((490*S,790*S,1120*S,849*S),radius=12*S,fill='#eaf4f6',outline='#bbd5df',width=2*S)
txt(d,805,820,'ONE BEARING GIVES A LINE OF POSITION, NOT A FIX',17,NAVY,True,'mm')
save(im,'plot-bearing-accurate.png')
