import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  isLoading = signal<boolean>(false);
  progress = signal<number>(0);
  isSuccess = signal<boolean>(false);

  private intervalId: any;

  // 1. Start the 0-95% Counter (Waiting for API)
  start() {
    this.reset();
    this.isLoading.set(true);

    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.progress.update(current => {
        // Stop at 95% and wait for the API to finish
        if (current >= 95) return 95;

        // Fast start, slow end logic
        const increment = current < 50 ? 2 : (current < 80 ? 0.5 : 0.2);
        return current + increment;
      });
    }, 40);
  }

  // 2. Smoothly Count the rest of the way (95% -> 100%)
  animateTo100(): Promise<void> {
    if (this.intervalId) clearInterval(this.intervalId);

    return new Promise((resolve) => {
      const finishInterval = setInterval(() => {
        this.progress.update(current => {

          // Stop when we reach 100
          if (current >= 100) {
            clearInterval(finishInterval);
            resolve(); // Tell the component we are done!
            return 100;
          }

          // Count up quickly to finish
          return current + 2;
        });
      }, 40); // Very fast updates (10ms) for smooth finish
    });
  }

  // 3. Reset everything
  reset() {
    this.isLoading.set(false);
    this.progress.set(0);
    this.isSuccess.set(false);
    if (this.intervalId) clearInterval(this.intervalId);
  }
}