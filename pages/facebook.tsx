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
  let url = "https://www.unegui.mn/avto-mashin/-avtomashin-zarna/";
  let urlSelector = '.ll8tlv6m .j83agx80 .btwxx1t3 .n851cfcs .hv4rvrfc .dati1w0a .pybr56ya'
  var count = 0;
  for(var i = 1; i < 2; i++){
    var urlList:any = await prepareList(url+'?page=' + i, urlSelector) || '';
    console.log("urlList = ", urlList.length);
    if(urlList.length == 0) break;
    await timer(1000);
    //urlList ||
    for (const item of urlList) {
      myItemList.push(await prepareItemBlock(item));
      console.log('Ажиллаж байна.', item);
      await timer(1000);
      count++;
    }
  }
  console.log("count:", count);
  console.log("myItemList", myItemList.length);
  return {
    props: { itemList: myItemList },
    revalidate: 10,
  };
}
//url list үүсгэж -> done
const prepareList = async (rawListHTML:any, getSelector:any) => {

  const browser = await playwright.chromium.launch();
  const data = await browser.newPage();
  await data.goto(rawListHTML);
  await data.waitForTimeout(1000);
  const myDate = await data.$$('.announcement-block__date');
  const myList = await data.$$('.announcement-block__title');
  let urlList: any = [];
  //myList.map(async (item: any, index: number)=>

  //Онгой зар, vip зар нь орж ирээд зөвхөн энгийн зар хэсгээ авч чадахгүй болохоор index=8 гэж эхэлсий 68
  for (var index = 8; index < 10; index++){
    let date = new Date("7 26, 2022 12:00");
    let day, month, year, hour, minute;
    var dateAvii = (await myDate[index].innerHTML()).trim();
    //Өдрийг нь л олж байгаан
    if(dateAvii.search('Өнөөдөр') == 0){
      year = date.getFullYear();
      month = ("0" + (date.getMonth() + 1)).slice(-2);
      day = ("0" + (date.getDate()+1)).slice(-2);
      hour = dateAvii.slice(8,10);
      minute = dateAvii.slice(11,13);
    } else if(dateAvii.search('Өчигдөр') == 0){
      year = date.getFullYear();
      month = ("0" + (date.getMonth() + 1)).slice(-2);
      day = ("0" + (date.getDate())).slice(-2);
      hour = dateAvii.slice(8,10);
      minute = dateAvii.slice(11,13);
    } else {
      year = dateAvii.slice(0,4);
      month = dateAvii.slice(5,7);
      day = dateAvii.slice(8,10);
      hour = dateAvii.slice(11,13);
      minute = dateAvii.slice(14,16);
    }
    //console.log(index, dateAvii, "link: ", "date utga", day, month, year, hour, minute);
    //Хэдний хэдэн цаг хүртлэхийг авах
    let urlDate = new Date(`${month} ${day}, ${year} ${hour}:${minute}`);
    if(urlDate > date) {
      urlList.push('https://www.unegui.mn'+ await myList[index].getAttribute('href'));
    } else {
      return urlList;
    }
  }
  console.log("prepareItemList urlList", urlList.length);
  return urlList;
}

//Энэ хэрэггүй юм байнадоо
/* ---------------------- callPage ---------------------- */
const callPage = async (url: string, getSelector: any) => {
  const browser = await playwright.chromium.launch();
  const data = await browser.newPage();
  await data.goto(url);
  await data.waitForTimeout(1000);
  const wholeData = await data.$$(getSelector)
  // get id
  var n = url.lastIndexOf('/');
  var myId = url.substring(n + 1);
  let myItemList: any[] = [];
  wholeData.map((item) => {
    const itemBlock = prepareItemBlock(item);
    myItemList.push(itemBlock);
  });

  return myItemList;
};

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

const unaaConfigs = {
  project: 'unaa',
  url: 'https://unaa.mn/suudlyin/honda/',
  itemBlockClass: '.listing__item',
  itemConfig: [
    {
      name: 'photo',
      class: '.listing__item__photo',
      callType: 'style.background.url',
    },

    { name: 'title', class: '.listing__item__title', callType: 'text' },
    { name: 'year', class: '.listing__item__year', callType: 'text' },
    {
      name: 'description',
      class: '.listing__item__description',
      callType: 'text',
    },
    { name: 'price', class: '.listing__item__price', callType: 'text' },
    { name: 'detail', class: '.listing__item__detail', callType: 'text' },
  ],
};

const uneguiConfigs = {
  project: 'unegui.mn',
  url: 'https://www.unegui.mn/adv/6239439_toyota-land-cruiser-200-2018-2018/',
  itemBlockClass: '._somon',
  replaceAllText: {
    // original: '/uploads',
    // changeText: 'https://news.cardoctor.mn/uploads',
    original: '',
    changeText: '',
  },
  itemConfig: [
    {name: 'title', class: '.title-announcement', callType: 'text',},
    {name: 'date', class: '.date-meta', callType: 'text'},
    //энэ 1 л зураг гаргаж байгаа доод талых нь гоё{ name: 'images', class: '.announcement__images', callType: 'img.src' },
    {name: 'imagesList', class: '.announcement__images-item', callType: 'img.srcList'},
    {name: 'price', class: '.announcement-price__cost', callType: 'text' },
    //энэ доор байгаа мэдээллүүд html ээрээ байгаа{ name: 'characteries', class: '.announcement-characteristics', callType: 'html',},
    {name: "authorName", class: ".author-name", callType: "text"},
    //доор байсан нэмэлт мэдээлэл
    {name: "description", class: ".announcement-description", callType: 'text'},
    {name: 'characteriesKey', class: '.key-chars', callType: 'list'},
    {name: 'characteriesValue', class: '.value-chars', callType: 'list'},
    {name: 'characteriesKeyValue', class: '.chars-column li', callType: 'listText'},
    {name: 'phoneNumber', class: '.contacts-dialog__phone a', callType: 'text'}
    // { name: 'copyright', class: '.copyright', callType: 'text' },
    // {
    //   name: 'image',
    //   class: '.image',
    //   callType: 'img.src',
    // },
  ]
};

const myConfig = uneguiConfigs;