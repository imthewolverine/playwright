import React from 'react';
import _ from 'lodash';
import * as playwright from 'playwright-core';

export default function Facebook(props: any) {
  console.log('DDDDDD', props.itemList);
  return (
    <div className="bg-yellow-100">
      {props.itemList.map((item: any, index: number) => {
        return (
            <div key={index}>
              <div className="bg-red-100 my-10">
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
            </div>
        )
      })}
    </div>
  );
}

const timer = (ms: any) => new Promise((res) => setTimeout(res, ms));

/* ------------------- getStaticProps ------------------- */
export async function getStaticProps() {
  let myItemList: any = [];
  let url = "https://www.facebook.com/groups/MashiniiZar/";
  let urlSelector = '.ll8tlv6m .j83agx80 .btwxx1t3 .n851cfcs .hv4rvrfc .dati1w0a .pybr56ya'
  var count = 0;
  var urlList:any = await prepareList(url, urlSelector) || '';
  await timer(1000);
  //urlList ||
  for (const item of urlList) {
    console.log("url", item);
    //myItemList.push(await prepareItemBlock(item));
    console.log('Ажиллаж байна.', url);   
    await timer(1000);
  }
  return {
    props: { itemList: myItemList },
    revalidate: 10,
  };
}
//url list үүсгэж -> done
const prepareList = async (rawListHTML:any, urlSelector:any) => {

  const browser = await playwright.chromium.launch();
  const data = await browser.newPage();
  await data.goto(rawListHTML);
  await data.waitForTimeout(1000);
  //const myDate = await data.$$('.announcement-block__date');
  const myList = await data.$$('.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.gpro0wi8.py34i1dx');
  let urlList= new Array();
  console.log("url", rawListHTML);
  console.log('mylist length = ', myList.length)
  //myList.map(async (item: any, index: number)=>
  for(var index = 0; index < myList.length; index++) {
    urlList.push(await myList[index].getAttribute('href'));
    console.log("fds", await myList[index].getAttribute('href'));
  }
  
  console.log("prepareItemList urlList", urlList.length);
  return urlList;
}

/* ------------------ prepareItemBlock ------------------ */
const prepareItemBlock = async (rawItemHTML: any) => {
  const browser = await playwright.chromium.launch();
  const data = await browser.newPage();
  await data.goto(rawItemHTML);
  await data.waitForTimeout(1000);
  //console.log("itemBlock", itemBlock.html());
  let myItem: any = {};
  //myConfig.itemConfig.map(async (item: any, index: number) => {
  for(var i = 0; i < myConfig.itemConfig.length; i++) {
    switch (myConfig.itemConfig[i].callType) {
      case 'img.srcList':
        const  myImg = await data.$$(myConfig.itemConfig[i].class) || '';
        var list = Array();
        for(var index = 0; index < myImg.length; index++) {
          list.push(await myImg[index].getAttribute('src'));
        }
        //myImg.forEach(async (item, index) => {
        //  list.push(await item.getAttribute('src'))
        //})
        myItem[myConfig.itemConfig[i].name] = list;
        break;
      case 'text':
        console.log("aaaaa", myConfig.itemConfig[i].class);
        myItem[myConfig.itemConfig[i].name] = (await data.locator(myConfig.itemConfig[i].class).textContent())?.trim() || '';
        break;
      case 'html':
        myItem[myConfig.itemConfig[i].name] = await data.locator(myConfig.itemConfig[i].class).innerHTML() || '';
        break;
      case 'list':
        var itemList = await data.$$(myConfig.itemConfig[i].class);
        var list = Array();
        for(var index = 0; index < itemList.length; index++) {
          list.push((await itemList[index].innerHTML()).trim().replace('\n                            \n                             ',''));
        }
        //itemList.map(async (item, index) => {
        //console.log("index = ", index, " item = ", item)
        //list[index] = await item.innerHTML() || '';
        //})
        //console.log("list = ", list);
        myItem[myConfig.itemConfig[i].name] = list;
        break;
      case 'listText':
        var itemList = await data.$$(myConfig.itemConfig[i].class);
        var list = Array();
        for(var index = 0; index < itemList.length; index++) {
          list.push((await itemList[index].textContent())?.trim().replace('\n                            \n                             ',''));
        }
        //itemList.map(async (item, index) => {
        //  list[index] = (await item.innerHTML()).replace('\n                            \n                             ','');
        //})
        myItem[myConfig.itemConfig[i].name] = list;
        break;
    }
    //console.log(item.name, ":", myItem[item.name]);
    
  }
  //)
  
  if (myConfig.replaceAllText) {
    const replaceAllText = myConfig.replaceAllText;

    _.keys(myItem).map((item: any, index: number) => {
      // console.log('index,', index);
      // console.log('item,', myItem[item].substring(0, 50));
      myItem[item] = _.replace(
        myItem[item],
        new RegExp(replaceAllText.original, 'g'),
        replaceAllText.changeText
      );
    });
  }

  if (myConfig.project === 'cardoctor') {
    myItem.title = _.capitalize(myItem.title);
    myItem.body = myItem.body + myItem.copyright;
  }
  //announcement-block__date
  //console.log("myItem", myItem);
  return myItem;
};

const facebookConfigs = {
  project: 'unegui.mn',
  itemBlockClass: '._somon',
  replaceAllText: {
    // original: '/uploads',
    // changeText: 'https://news.cardoctor.mn/uploads',
    original: '',
    changeText: '',
  },
  itemConfig: [
    {name: 'title', class: '.gmql0nx0.l94mrbxd.p1ri9a11.lzcic4wl.aahdfvyu.hzawbc8m', callType: 'text',},
    {name: 'date', class: '.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.fe6kdd0r.mau55g9w.c8b282yb.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.mdeji52x.e9vueds3.j5wam9gi.b1v8xokw.m9osqain.hzawbc8m', callType: 'text'},
    //энэ 1 л зураг гаргаж байгаа доод талых нь гоё{ name: 'images', class: '.announcement__images', callType: 'img.src' },
    {name: 'imagesList', class: '.i09qtzwb.n7fi1qx3.datstx6m.pmk7jnqg.j9ispegn.kr520xx4.k4urcfbm', callType: 'img.srcList'},
    {name: "description", class: ".kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q", callType: 'text'},
    {name: "texts", class: ".qzhwtbm6.knvmm38d", callType: "listText"}
  ]
};

const myConfig = facebookConfigs;