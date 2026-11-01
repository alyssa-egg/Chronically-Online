import {accessToken,forgetSession} from './membership.js';
export async function capsuleAPI(action,body=null,authenticated=false){
 const query=typeof action==='string'?action:'config';
 const response=await fetch(`/api/capsule/${query}`,{method:body?'POST':'GET',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(authenticated?{Authorization:`Bearer ${await accessToken()}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)}).catch(()=>{throw new Error('The shared archive could not connect. Your local files are safe.');});
 const data=await response.json().catch(()=>({error:'The shared archive could not respond.'}));if(!response.ok){if(response.status===401)forgetSession();throw new Error(data.error||'Please try again.');}return data;
}
