#version 400 core
layout (location = 0) in vec3 position;
layout (location = 2) in vec2 texCoord;
uniform vec4 mposition;
float cubicInterpolate (vec4 moj, float x) {
	return float(moj.y + 0.5 * x*(moj.z - moj.x + x*(2.0*moj.x - 5.0*moj.y + 4.0*moj.z - moj.w + x*(3.0*(moj.y - moj.z) + moj.w - moj.x))));
}

float bicubicInterpolate (vec4 p[4],float x, float y) {
	vec4 arr;
	arr.x = float(cubicInterpolate(p[0], y));
	arr.y = float(cubicInterpolate(p[1], y));
	arr.z = float(cubicInterpolate(p[2], y));
	arr.w = float(cubicInterpolate(p[3], y));
	return cubicInterpolate(arr, x);
}
float noise(int x,int y,int s)
{
	//vec2 co=vec2(x*s,y*s);
    //return sin(dot(co.xy*s ,vec2(12.9898,78.233)))/2;
	//return (((x^0x54394364+y^0x76595413)*(s+x+y))%100000000)/100000000.0f;
    int v=0;
    v+=(x*y+x+y)^0x54543512;
    return ((645463334+(((x<<8)^0x42343243+y<<8^0x89542372+x*y^0x78693021)+v)*s)%100000000)/100000000.0f;
}
float getHeight2(float x,float y,int seed,int octavMin,int octavMax){
    vec4 p[4];
    int xx[4],yy[4];
    float suma=0;
    //register int x1,x2,y1,y2;
    for(int i=octavMin;i<octavMax;i++)
    {

        //printf("1 x=%5d %5d %5d %5d y= %5d %5d %5d %5d\n",xx[0],xx[1],xx[2],xx[3],yy[0],yy[1],yy[2],yy[3]);
        int z=(1<<i);
        xx[0]=(int(float(x/z))-1);
        xx[1]=(xx[0]+1)*z;
        xx[2]=(xx[0]+2)*z;
        xx[3]=(xx[0]+3)*z;
        xx[0]*=z;

        yy[0]=(int(float(y/z))-1);
        yy[1]=(yy[0]+1)*z;
        yy[2]=(yy[0]+2)*z;
        yy[3]=(yy[0]+3)*z;
        yy[0]*=z;
        //printf("2 x=%5d %5d %5d %5d y= %5d %5d %5d %5d\n\n",xx[0],xx[1],xx[2],xx[3],yy[0],yy[1],yy[2],yy[3]);

        p[0][0]=noise(xx[0],yy[0],seed);//prev %256/256.0f;
        p[0][1]=noise(xx[0],yy[1],seed);//     -//-
        p[0][2]=noise(xx[0],yy[2],seed);//     ...
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
        suma+=(bicubicInterpolate(p,(x-xx[1])/z,(y-yy[1])/z)-0.5)/(1<<(octavMax-i));
    }
    return suma;
}
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
out vec2 TexCoord;
out vec4 vertexColor;
out vec2 coordy;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{	
	vec3 nowy;
	float dist=sqrt(nowy.x*nowy.x+nowy.z*nowy.z);
	float szum1=getHeight2((position.x+mposition.x)/2,(position.z+mposition.z)/2,756651,13,15);
	float szum2=getHeight2((position.x+mposition.x),(position.z+mposition.z),7566651,2+int(dist/32768.0f),14);
nowy=vec3(position.x,60000*szum1*szum2,position.z);//
	TexCoord = vec2(nowy.y,nowy.x);
	coordy=vec2(nowy.x,nowy.z);
	if(nowy.y<0) nowy.y=0;
	/*if(nowy.y<0) {vertexColor=vec4(0,(3+sin(nowy.y/40.0f))/12.0f+0.5-(-nowy.y/2000),0.7+(-nowy.y/2000),0);nowy.y=0;}
	else if(nowy.y<20) vertexColor=vec4(1,1,0.0,0);
	else if(nowy.y<3000) vertexColor=vec4(0,(0.15+nowy.y/3000.0f)/1.15,0.0,0);
	else if(nowy.y>3000) vertexColor=vec4(1,1,1,0);
	else
	vertexColor=vec4((nowy.y+500)/1000.0f,(1+sin(nowy.y/100.0f))/2,(1+sin(nowy.y/220.0f))/2,1.0f);*/
    gl_Position = projection * view * model * vec4(nowy, 1.0f);
	float scaleX=ceil((abs(position.x)/32.0f));
	
	/*float scaleZ=ceil((abs(position.z)/32.0f));
	float scale=0;
	if(scaleX>=scaleZ) scale=scaleX;
	if(scaleZ>=scaleX) scale=scaleZ;
    TexCoord = vec2(texCoord.x*scale, (1.0 - texCoord.y)*scale);*/
	
}