from pathlib import Path
import struct
import zlib
def rgba(path,width,height):
 data=Path(path).read_bytes()
 assert data[:8]==b'\\x89PNG\\r\\n\\x1a\\n',path
 pos=8;raw=b''
 while pos<len(data):
  length=int.from_bytes(data[pos:pos+4],'big');pos+=4
  code=data[pos:pos+4];pos+=4
  chunk=data[pos:pos+length];pos+=length+4
  if code==b'IHDR':
   w,h,bit,ctype,_,_,_=struct.unpack('>IIBBBBB',chunk)
   assert (w,h,bit,ctype)==(width,height,8,6),(path,w,h)
  if code==b'IDAT':raw+=chunk
 decoded=zlib.decompress(raw)
 assert len(decoded)==height*(width*4+1)
 assert all(decoded[y*(width*4+1)]==0 for y in range(height))
 return decoded
can=rgba('assets/trees/canopy-atlas.png',768,576)
pig=rgba('assets/trees/pigment-atlas.png',512,384)
def alpha(data,width,x,y):
 return data[y*(width*4+1)+1+4*x+3]
for row in range(6):
 for col in range(8):
  center=alpha(can,768,col*96+48,row*96+48)
  edge=alpha(can,768,col*96+2,row*96+2)
  assert center>205,(col,row,'canopy center transparent',center)
  assert edge<24,(col,row,'opaque square background',edge)
for row in range(3):
 for col in range(4):
  center=alpha(pig,512,col*128+64,row*128+64)
  edge=alpha(pig,512,col*128+1,row*128+1)
  assert 20<center<160,(col,row,center)
  assert edge<8,(col,row,edge)
print('MAP-0013 PNG: 48 canopy crops with solid centres and 12 soft transparent pigment washes')
