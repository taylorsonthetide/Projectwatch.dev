#![no_std]
use core::panic::PanicInfo;
#[panic_handler]
fn panic(_: &PanicInfo) -> ! { loop {} }
// Frame rows: u/v/gust for wind; height/period/sin(direction)/cos(direction) for waves.
static mut FRAME: [f64; 8400] = [0.0;8400];
static mut OUT: [f64; 8] = [0.0;8];
#[no_mangle] pub extern "C" fn frame_ptr() -> *mut f64 { core::ptr::addr_of_mut!(FRAME).cast() }
#[no_mangle] pub extern "C" fn output_ptr() -> *mut f64 { core::ptr::addr_of_mut!(OUT).cast() }
#[no_mangle] pub unsafe extern "C" fn sample(nx:i32,ny:i32,x:f64,y:f64,waves:i32)->i32 {
 if nx<2 || ny<2 || nx*ny>2100 || !x.is_finite() || !y.is_finite() || x<0.0 || y<0.0 || x>(nx-1) as f64 || y>(ny-1) as f64 {return 0;}
 let i=(x as usize).min(nx as usize-2); let j=(y as usize).min(ny as usize-2);
 let a=x-i as f64;let b=y-j as f64;let p=j*nx as usize+i;
 let indices=[p,p+1,p+nx as usize,p+nx as usize+1];let weights=[(1.0-a)*(1.0-b),a*(1.0-b),(1.0-a)*b,a*b];
 let channels=if waves==1 {4} else {3};
 for c in 0..channels {OUT[c]=0.0;for k in 0..4 {if weights[k]<1e-9 {continue;}let v=FRAME[indices[k]*4+c];if !v.is_finite(){return 0;}OUT[c]+=v*weights[k];}}
 if waves==1 && OUT[2]*OUT[2]+OUT[3]*OUT[3]<1e-12 {return 0;}1
}
