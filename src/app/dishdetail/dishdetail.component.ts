import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Comment } from '../shared/comment';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
    commentForm: FormGroup;
    comment: Comment;

    formErrors = {
      'author': '',
      'rating': 5,
      'comment': ''
    };
  
    validationMessages = {
      'author': {
        'required':      'Author Name is required.',
        'minlength':     'Author Name must be at least 2 characters long.',
        'maxlength':     'Author cannot be more than 25 characters long.'
      },
      'comment': {
        'required':      'Comment is required.',
        'minlength':     'Comment must be at least 2 characters long'

      },
    };

    dish: Dish;
    dishcopy: Dish;
    dishIds: string[];
    prev: string;
    next: string;
  
    constructor(private dishservice: DishService,
      private route: ActivatedRoute,
      private location: Location, 
      private fb: FormBuilder,
      @Inject('BaseURL') public BaseURL) { 
        this.createForm();
      }
  
      ngOnInit() {
        this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
        this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
        .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); this.dishcopy = dish;});
      }

      createForm() {
        this.commentForm = this.fb.group({
          author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
          rating: 5,
          // date: Date(),
          comment: ['', [Validators.required, Validators.minLength(2)] ]
        });
    
        this.commentForm.valueChanges
          .subscribe(data => this.onValueChanged(data));
    
        this.onValueChanged(); // (re)set validation messages now
      }

      onValueChanged(data?: any) {
        if (!this.commentForm) { return; }
        const form = this.commentForm;
        for (const field in this.formErrors) {
          if (this.formErrors.hasOwnProperty(field)) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
              const messages = this.validationMessages[field];
              for (const key in control.errors) {
                if (control.errors.hasOwnProperty(key)) {
                  this.formErrors[field] += messages[key] + ' ';
                }
              }
            }
          }
        }
      }

      onSubmit() {
        this.comment = this.commentForm.value;
        this.comment.date = new Date().toISOString();
        this.dishcopy.comments.push(this.comment);
        console.log(this.comment);
        this.commentForm.reset({
          author: '',
          rating: 5,
          comment: ''
        });
        
      }

      setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
      }
  
    goBack(): void {
      this.location.back();
    }
  
  }
