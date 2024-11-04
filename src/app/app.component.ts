import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, fromEvent, debounceTime, map, filter, distinct, Observable, distinctUntilChanged } from 'rxjs';

interface Post {
  id: number;
  title: string;
  content: string;
}



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgFor, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('postsContainer') postsContainer!: ElementRef;
  
  private pageSize = 10;
  private currentPage = 1;
  private allPosts: Post[] = [];
  private postsSubject = new BehaviorSubject<Post[]>([]);
  
  posts$ = this.postsSubject.asObservable();
  loading = false;
  hasMore = true;

  constructor() {
    // Generate mock data
    this.generateMockPosts();
    // Load initial posts
    this.loadMorePosts();
  }

  ngAfterViewInit() {
    // Set up scroll listener
    fromEvent(this.postsContainer.nativeElement, 'scroll')
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.checkScroll();
      });
  }

  private checkScroll() {
    const element = this.postsContainer.nativeElement;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
      !this.loading &&
      this.hasMore
    ) {
      this.loadMorePosts();
    }
  }

  private loadMorePosts() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const newPosts = this.allPosts.slice(startIndex, endIndex);
      
      if (newPosts.length === 0) {
        this.hasMore = false;
      } else {
        const currentPosts = this.postsSubject.getValue();
        this.postsSubject.next([...currentPosts, ...newPosts]);
        this.currentPage++;
      }
      
      this.loading = false;
    }, 1000);
  }

  private generateMockPosts() {
    for (let i = 1; i <= 100; i++) {
      this.allPosts.push({
        id: i,
        title: `Post ${i}`,
        content: `This is the content for post ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
      });
    }
  }
}
