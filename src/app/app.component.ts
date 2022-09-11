import { Component, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Post } from "./post.model";
import { PostsService } from "./postsService";
import { Subscription } from "rxjs";
import { Form, NgForm } from "@angular/forms";
import { ViewChild } from "@angular/core";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild("postForm") postForm: NgForm;
  loadedPosts: Post[] = [];
  isFetchDataPending = false;
  error = null;
  errorSubscription: Subscription;
  constructor(private http: HttpClient, private postsService: PostsService) {
    setInterval(() => {
      this.onFetchPosts();
    }, 60000);
  }

  ngOnInit() {
    this.isFetchDataPending = true;
    this.postsService.fetchPosts().subscribe(
      (posts: Post[]) => {
        this.loadedPosts = [...posts];
        this.isFetchDataPending = false;
      },
      (error) => {
        this.error = "error in fetching data !";
      }
    );
  }

  onCreatePost(postData: Post) {
    this.postsService.sendPosts(postData);
    this.onFetchPosts();
    this.errorSubscription = this.postsService.error.subscribe((e) => {
      if (e) {
        console.log(e);
        this.error = "error in sending Data!";
      } else {
        this.loadedPosts.push(postData); //could be added if sending the post is done !
      }
    });
    this.postForm.form.patchValue({ title: "", content: "" });
  }
  onFetchPosts() {
    this.isFetchDataPending = true;
    this.postsService.fetchPosts().subscribe(
      (posts: Post[]) => {
        this.loadedPosts = [...posts];
        this.isFetchDataPending = false;
      },
      (error) => {
        this.postsService.error.subscribe((e) => {
          this.error = e;
        });
        this.isFetchDataPending = false;
      }
    );

    // Send Http request
  }

  onClearPosts(id = null) {
    this.postsService.deletePosts().subscribe(
      (data) => (this.loadedPosts = []),
      (error) => {
        this.error = "Error in deleting Posts";
      }
    );
  }
  onDeletePost(id: string) {
    this.postsService.deletePosts(id).subscribe(
      (data) =>
        (this.loadedPosts = this.loadedPosts.filter((item) => item.id !== id)),
      (error) => {
        this.error = "Error in deleting Post";
      }
    );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.errorSubscription.unsubscribe();
  }
}
