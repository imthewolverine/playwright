import React from 'react';
import Sharp from 'sharp'
import sharpImages from '../json/sharpImages.json'
import axios from 'axios';

export default function SharpImages(props: any) {
    var length = props.itemList.length;
    return (
      <div className="bg-yellow-100">
        hello {length}
      {props.itemList.map((item: any, index: number) => {
        return (
            <div key={index}>
              <div className="bg-red-100 my-10">
                helo
                <img src={'data:image/jpeg;base64,'+item}/>
              </div>
            </div>
        )
      })}
    </div>
    );
}

export async function getStaticProps() {
  let imageList = new Array();
  for(var index = 0; index < sharpImages.length; index++ ) {
    const imageResponse = await axios({url: sharpImages[index], responseType: 'arraybuffer'});
    const buffer = Buffer.from(imageResponse.data, 'base64');
    let src = Sharp(buffer);
    const metadata = await src.metadata();
    console.log(metadata.width, metadata.height);
    try {
        src.extract({ left: 0, top: 70, width: Number(metadata.width), height: Number(metadata.height)-70 });
        src.extract({ left: 0, top: 70, width: Number(metadata.width), height: Number(metadata.height)-140 });
        src.jpeg();
        let buf = new Buffer(await src.toBuffer()).toString('base64')
        //console.log('buf', buf);
        imageList.push(buf);
    } catch(e) {
        console.log(e);
    }
  };

  return {
    props: { itemList: imageList },
    revalidate: 10,
  };
}