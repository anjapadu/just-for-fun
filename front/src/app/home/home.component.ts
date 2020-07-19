import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as MediumEditor from 'medium-editor';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as moment from 'moment'
declare global {
    interface Window { MathJax: any; }
}
window.MathJax = window.MathJax || {};

export interface User { name?: string; id: string; text: string; updated_on?: number }
export interface Svg { code: string; svg: string }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayName = ''
  text = ''
  isLoading = true
  lastSaved = 'Never'
  public editor
  private user
  public timer
  private userCollection: AngularFirestoreCollection<User>; 
  users: Observable<User[]>;
  constructor(public auth: AngularFireAuth, public router: Router, private readonly fb: AngularFirestore) { 
    this.userCollection = fb.collection<User>('users');
    this.auth.currentUser.then((u)=>{
      this.user  = u
      this.displayName  = u.displayName
    })
    this.onEdit = this.onEdit.bind(this)
    this.users= this.userCollection.valueChanges();

  }

  ngOnInit(): void {
    this.editor = new MediumEditor('.editable')
    this.editor.subscribe('editableInput', this.onEdit)
    this.fb.collection('users').doc(this.user.uid).valueChanges().subscribe((response: User) => {
      if(this.isLoading){
        this.editor.setContent(response ? response.text : '')
        if(this.timer){
          clearTimeout(this.timer)
        }
        this.lastSaved = response ? moment.utc(response.updated_on).local().fromNow()  : 'Never'
        this.isLoading = false
      }else{
        this.lastSaved = response ? moment.utc(response.updated_on).local().fromNow()  : 'Never'
      }
    });
  }

  async onEdit(event, editable): Promise<void>{
    let content  =  editable.innerHTML
    if(this.timer){
      clearTimeout(this.timer)
    }
    const matchedLatex = event.target.innerHTML.match(/\$(.*?)\$/g)
    if (matchedLatex){
      for (let i in matchedLatex){
        const  svg = await this.latexToImage(matchedLatex[i], matchedLatex[i].replace(/\$/g,''))
        content = content.replace(svg.code, `<img src="${svg.svg}"/>`)
      }
      this.editor.setContent(content)
      const images = document.getElementsByTagName('img')
      this.editor.selectElement(images[images.length -1])
      const selection = this.editor.exportSelection()
      this.editor.importSelection({
        start: selection.start,
        end: selection.end,
        trailingImageCount: 1
      },true)

    }
    this.timer = setTimeout(()=>{
        const user: User = {id: this.user.uid, text: editable.innerHTML, updated_on: moment.utc().valueOf()}
        this.userCollection.doc(this.user.uid).set(user)
    }, 600)
  }

  latexToImage(code, text): Promise<Svg>{
    return new Promise((resolve, reject) => {
      try{
        let wrapper = window.MathJax.tex2svg(`${text}`, { em: 10, ex: 5, display: true })
        let output = { svg: "", img: "" }
        let mjOut = wrapper.getElementsByTagName("svg")[0]
        output.svg = mjOut.outerHTML
        let result = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(output.svg)));
        resolve({code, svg: result})
      }catch (e){
        reject()
      }
      
    })
  }
  logout() {
    this.auth.signOut().then(()=>{
        this.router.navigate([""])
    });
  }
  ngOnDestroy():void{
    this.editor.subscribe('editableInput', this.onEdit)
  }

}
