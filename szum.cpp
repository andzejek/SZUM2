#include "szum.h"
float cubicInterpolate (double p[4], double x) {
	return p[1] + 0.5 * x*(p[2] - p[0] + x*(2.0*p[0] - 5.0*p[1] + 4.0*p[2] - p[3] + x*(3.0*(p[1] - p[2]) + p[3] - p[0])));
}
double bicubicInterpolate (double p[4][4], double x, double y) {
	double arr[4];
	arr[0] = cubicInterpolate(p[0], y);
	arr[1]= cubicInterpolate(p[1], y);
	arr[2] = cubicInterpolate(p[2], y);
	arr[3] = cubicInterpolate(p[3], y);
	return cubicInterpolate(arr, x);
}
inline float noise(int x,int y,int s){
    int v=0;
    v+=(x*y+x+y)^0x54543512;
    return ((645463334+(((x<<8)^0x42343243+y<<8^0x89542372+x*y^0x78693021)+v)*s)%100000000)/100000000.0f;
}
double getHeight(float x,float y,int seed,int octavMin,int octavMax){
    double p[4][4];
    int xx[4],yy[4];
    double sum=0;
    for(int i=octavMin;i<octavMax;i++)
    {
        /*int z=(1<<i);
        xx[0]=(int((float)x/z)-1)*z;
        xx[1]=int((float)x/z)*z;
        xx[2]=int(c((float)x/z))*z;
        xx[3]=int(c((float)x/z)+1)*z;
        yy[0]=(int((float)y/z)-1)*z;
        yy[1]=int((float)y/z)*z;
        yy[2]=int(c((float)y/z))*z;
        yy[3]=int(c((float)y/z)+1)*z;*/
        int z=(1<<i);
        xx[0]=(int((float)x/z)-1);
        xx[1]=(xx[0]+1)*z;
        xx[2]=(xx[0]+2)*z;
        xx[3]=(xx[0]+3)*z;
        xx[0]*=z;

        yy[0]=(int((float)y/z)-1);
        yy[1]=(yy[0]+1)*z;
        yy[2]=(yy[0]+2)*z;
        yy[3]=(yy[0]+3)*z;
        yy[0]*=z;

        p[0][0]=noise(xx[0],yy[0],seed);
        p[0][1]=noise(xx[0],yy[1],seed);
        p[0][2]=noise(xx[0],yy[2],seed);
        p[0][3]=noise(xx[0],yy[3],seed);
        p[1][0]=noise(xx[1],yy[0],seed);
        p[1][1]=noise(xx[1],yy[1],seed);
        p[1][2]=noise(xx[1],yy[2],seed);
        p[1][3]=noise(xx[1],yy[3],seed);
        p[2][0]=noise(xx[2],yy[0],seed);
        p[2][1]=noise(xx[2],yy[1],seed);
        p[2][2]=noise(xx[2],yy[2],seed);
        p[2][3]=noise(xx[2],yy[3],seed);
        p[3][0]=noise(xx[3],yy[0],seed);
        p[3][1]=noise(xx[3],yy[1],seed);
        p[3][2]=noise(xx[3],yy[2],seed);
        p[3][3]=noise(xx[3],yy[3],seed);
        sum+=(bicubicInterpolate(p,(x-xx[1])/z,(y-yy[1])/z)-0.5f)/(1<<(octavMax-i));
    }
    return sum;
}
