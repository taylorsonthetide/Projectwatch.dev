(function(root){
function estimate(r,boat){
 const result={record:r,price:null,reason:null};const fail=reason=>({...result,reason});
 if(!r.rankable)return fail(r.review_reason||'Confirm current tariff');
 let len=Number(boat.length),beam=Number(boat.beam)||null,weight=Number(boat.weight)||null;if(!Number.isFinite(len)||len<=0)return fail('Enter a boat length');
 if(r.maximum_length&&(len>r.maximum_length||(r.maximum_length_exclusive&&len>=r.maximum_length)))return fail('Outside published length limit');
 if(r.maximum_weight_t&&weight&&weight>r.maximum_weight_t)return fail('Outside published weight limit');
 let multi=boat.profile==='multihull';if(multi&&!r.multihull_multiplier&&!r.multihull_annual_rate)return fail('Multihull quote needed');if(multi&&r.multihull_is_from)return fail('Multihull from-price needs confirmation');
 if(r.round_length_increment)len=Math.round(len/r.round_length_increment)*r.round_length_increment;
 if(r.ceil_length_increment)len=Math.ceil((len-1e-9)/r.ceil_length_increment)*r.ceil_length_increment;
 let charged=Math.max(len,r.minimum_length||0),rate=r.annual_rate,fixed=r.annual_fixed,foot=r.rate_type.includes('foot');let basis=foot?charged/0.3048:charged;
 if(r.bands){
  let matching;
  if(r.rate_type==='fixed_by_berth_size')matching=r.bands.filter(b=>b.berth_length>=len).sort((a,b)=>a.berth_length-b.berth_length).slice(0,1);
  else if(r.rate_type==='berth_size_fixed')matching=r.bands.filter(b=>b.max>=len).sort((a,b)=>a.max-b.max).slice(0,1);
  else matching=r.bands.filter(b=>(b.min==null||basis>b.min||(basis===b.min&&!b.min_exclusive))&&(b.max==null||basis<b.max||(basis===b.max&&!b.max_exclusive))&&(!b.dayboat_only||boat.profile==='dayboat')&&(!b.restriction||!b.restriction.toLowerCase().includes('day boat')||boat.profile==='dayboat'));
  if(!matching.length)return fail('No verified tariff for this length / boat type');
  if(matching.length>1)return fail('Overlapping tariff bands: ask marina');
  rate=matching[0].rate;fixed=matching[0].fixed;
 }
 if(multi&&r.multihull_annual_rate)rate=r.multihull_annual_rate;
 if(rate==null&&fixed==null)return fail('Annual quote required');
 let berth=fixed!=null?fixed:rate*basis;if(multi&&r.multihull_multiplier)berth*=r.multihull_multiplier;
 if(r.surcharge_length&&len>=r.surcharge_length)berth*=r.surcharge_multiplier||1;
 let extras=(r.mandatory_fee_fixed||0)+(r.mandatory_fee_per_m||0)*charged;let vat=r.vat_included===false?1+r.vat_rate:1;
 return {...result,price:(berth+extras)*vat,berth:berth*vat,extras:extras*vat,charged,rate,vatAdded:r.vat_included===false};
}
root.marinaEstimate=estimate;if(typeof module!=='undefined')module.exports={estimate};
})(typeof window!=='undefined'?window:globalThis);
