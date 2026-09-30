const L=__dirname+'/lib/';
module.exports=async ctx=>{
 await ctx.route(/cdnjs\.cloudflare\.com.*pdf\.min\.js/,r=>r.fulfill({path:L+'pdfjs-dist-3.11.174/build/pdf.min.js',contentType:'application/javascript'}));
 await ctx.route(/cdnjs\.cloudflare\.com.*pdf\.worker\.min\.js/,r=>r.fulfill({path:L+'pdfjs-dist-3.11.174/build/pdf.worker.min.js',contentType:'application/javascript'}));
 await ctx.route(/jszip/,r=>r.fulfill({path:L+'jszip-3.10.1/dist/jszip.min.js',contentType:'application/javascript'}));
 await ctx.route(/html2canvas/,r=>r.fulfill({path:L+'html2canvas-1.4.1/dist/html2canvas.min.js',contentType:'application/javascript'}));
 await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
};
