// Personal comfort comparison. Codes: 0 missing, 1 within, 2 near, 3 above.
extern "C" {
int classify(double height,double period,double wind,double gust,double height_limit,double period_limit,double wind_limit){
 if(!(height_limit>0)||!(period_limit>0)||!(wind_limit>0))return 0;
 bool h=height>=0,w=wind>=0,g=gust>=0,p=period>0;
 if((h&&height>height_limit)||(w&&wind>wind_limit)||(g&&gust>wind_limit))return 3;
 bool meaningful=h&&height>=(height_limit*.5<1?height_limit*.5:1);
 bool near=h&&height>=height_limit*.8,short_period=meaningful&&p&&period<period_limit;
 if(near&&short_period)return 3;
 if(!h||!w||!g||(meaningful&&!p))return 0;
 if(near||short_period||wind>=wind_limit*.8||gust>=wind_limit*.8)return 2;
 return 1;
}
}
