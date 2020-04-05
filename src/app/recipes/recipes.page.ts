import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from './recipe.model';
import { RecipesService } from './recipes.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit,OnDestroy {
  recipes:Recipe[];
  constructor(private recipesService:RecipesService,private route:ActivatedRoute) { 
    /*route.params.forEach(params => {
      //console.log(params);
      this.recipes=this.recipesService.getAllRecipes();
    });*/
  }


  ngOnInit() {    
    console.log('ngOnInit');
    console.log(this.recipes);
  }

  ionViewWillEnter(){
    this.recipes=this.recipesService.getAllRecipes();
    console.log('ionViewWillEnter');
  }

  ionViewDidEnter(){
    console.log('ionViewDidEnter');
  }

  ionViewWillLeave(){
    console.log('ionViewWillLeave');
  }

  ionViewDidLeave(){
    console.log('ionViewDidLeave');
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    
  }

}
