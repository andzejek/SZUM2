/*#version 330 core
in vec2 TexCoord;
in vec4 vertexColor;
out vec4 color;

uniform sampler2D ourTexture1;
uniform sampler2D ourTexture2;

void main()
{
	//color=vertexColor;
    color = mix(texture(ourTexture1, TexCoord), texture(ourTexture2, TexCoord), 0.2);
}*/
#version 400

uniform sampler2D ourTexture1;
uniform vec4 mposition;
in vec2 coordy;
in vec2 TexCoord;
in vec4 vertexColor;
out vec4 fragColor;
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

void main()
{
	vec3 nowy=vec3(TexCoord.y,TexCoord.x,0);
    float mipmapLevel = textureQueryLod(ourTexture1, TexCoord).x;
    fragColor = textureLod(ourTexture1, TexCoord, mipmapLevel)*vertexColor+vec4(0.2,0.2,0.2,0);
	fragColor = vertexColor;
	float szum=getHeight2(coordy.x+mposition.x,coordy.y+mposition.z,756651,5,10);
	float szum2=getHeight2(coordy.x+mposition.x,coordy.y+mposition.z,756651,5,6);
	if(nowy.y<0) {fragColor=vec4(0,(3+sin(nowy.y/40.0f))/12.0f+0.5-(-nowy.y/2000),0.7+(-nowy.y/2000),0);nowy.y=0;}
	else if(nowy.y<30+szum*60) fragColor=vec4(1,1,0.0,0);
	else if(nowy.y<(2700+szum*2000)) fragColor=vec4(szum,(0.15+nowy.y/3000.0f)/1.15+szum,szum,0);
	else if(nowy.y<(3000+szum*2000)) 
	{
	vec4 color1=vec4(szum,(0.15+nowy.y/3000.0f)/1.15+szum,szum,0);
	vec4 color2=vec4(0.7+(nowy.y-3000)/3000+szum2,0.7+(nowy.y-3000)/3000+szum2,0.7+(nowy.y-3000)/3000+szum2,0);
		float a=(nowy.y-(2700+szum*2000))/(3000+szum*2000-(2700+szum*2000));
		fragColor=color1* (1 - a) + color2 * a;
	}
	else if(nowy.y>(3000+szum*2000)) fragColor=vec4(0.7+(nowy.y-3000)/3000+szum2,0.7+(nowy.y-3000)/3000+szum2,0.7+(nowy.y-3000)/3000+szum2,0);
	else
	fragColor=vec4((nowy.y+500)/1000.0f,(1+sin(nowy.y/100.0f))/2,(1+sin(nowy.y/220.0f))/2,1.0f);
	float distance=sqrt(coordy.x*coordy.x+coordy.y*coordy.y);
	float fogAmount = 1.0 - exp( -distance*0.00003f );
    vec4  fogColor  = vec4(0.0,0.3,0.4,1);
    fragColor=mix( fragColor, fogColor, fogAmount );
}