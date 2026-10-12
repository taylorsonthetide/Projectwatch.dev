// Freestanding C++20: no runtime or allocator; JS owns bounded scratch memory.
extern "C" {
static double points[400000];
static double boxes[360000];
static int selected[60000];
static int occupied_x[4096], occupied_y[4096];
unsigned points_ptr(){return (unsigned)(unsigned long)points;}
unsigned boxes_ptr(){return (unsigned)(unsigned long)boxes;}
unsigned selected_ptr(){return (unsigned)(unsigned long)selected;}
int bounds(int count){
 if(count<1||count>200000)return 0;
 double w=points[0],s=points[1],e=w,n=s;
 for(int i=1;i<count;++i){double x=points[2*i],y=points[2*i+1];if(x<w)w=x;if(x>e)e=x;if(y<s)s=y;if(y>n)n=y;}
 boxes[0]=w;boxes[1]=s;boxes[2]=e;boxes[3]=n;return 1;
}
int filter_bounds(int count,double w,double s,double e,double n,int mask){
 if(count<0||count>60000)return -1;int out=0;
 for(int i=0;i<count;++i){double* b=boxes+6*i;int layer=(int)b[4];if(layer<0||layer>5)continue;
 if((mask&(1<<layer))&&b[0]<=e&&b[2]>=w&&b[1]<=n&&b[3]>=s)selected[out++]=i;}
 return out;
}
int floor_cell(double v){int i=(int)v;return v<i?i-1:i;}
int declutter(int count,double width,double height,int limit){
 if(count<0||count>200000||width<=0||height<=0||limit<0||limit>4096)return -1;
 int used=0;for(int i=0;i<count&&used<limit;++i){int x=floor_cell(points[2*i]/width),y=floor_cell(points[2*i+1]/height);bool found=false;
 for(int k=0;k<used;++k)if(occupied_x[k]==x&&occupied_y[k]==y){found=true;break;}
 if(!found){occupied_x[used]=x;occupied_y[used]=y;selected[used++]=i;}}
 return used;
}
}
