---
title: "Custom UIViews"
subtitle: "A clean way to connect custom UIView classes with their corresponding xib files"
date: 2014-02-18
category: "code"
tags: "Objective-C, UIView"
layout: blog-post.hbs
---

A long time ago, when I was just starting with Objective-C and Xcode, a big source of frustration for me was finding a clean way to connect my custom UIView classes with their corresponding xib files. I'm not sure what tutorials are out there now since then but in any case I'll show you how I like to do it. I think it's pretty simple, however if you have a better method, please let me know.

### So why do we even need this?

In just about every app, there is usually at least one custom view that needs to be reused in many view controllers. To illustrate this I'm going to show an example with a reusable loading spinner. I'll attach a link to the full source of my demo app at the bottom of this post.

### The Code

_I'm going to assume you already have some basic Objective-C skills and are already familiar with Xcode. If you have that, you should be able to follow along no problem._

The first step is to create a new single view project. Once you've done that create a new class in your project called `LoadingView`. Below are my header and implementation files. Scan through them real quick and I'll go over the important parts below.

```objectivec
//
//  LoadingView.h
//
//  Created by Reed Dadoune on 4/23/12.
//  Copyright (c) 2012 Reed Dadoune. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface LoadingView : UIView

@property (weak, nonatomic) IBOutlet UILabel *loadingLabel;
@property (readonly) BOOL loading;

- (void)centerView;
- (void)show;
- (void)showWithCompletion:(void (^)(BOOL))callback;
- (void)dismiss;
- (void)dismissWithCompletion:(void (^)(BOOL))callback;

+ (LoadingView *)loadingView;

@end

```

```objectivec
//
//  LoadingView.m
//
//  Created by Reed Dadoune on 4/23/12.
//  Copyright (c) 2012 Reed Dadoune. All rights reserved.
//

#import <QuartzCore/QuartzCore.h>
#import "LoadingView.h"

@interface LoadingView()

@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *spinner;
@property (nonatomic) NSInteger showCount;

@end

@implementation LoadingView

#pragma mark - Properties

- (BOOL)loading
{
    // If show count is greater than 0
    // We must be loading
    return (self.showCount > 0);
}

- (void)setShowCount:(NSInteger)showCount
{
    if (showCount < 0) {
        // Prevent showCount from ever
        // going below zero
        _showCount = 0;
    } else {
        _showCount = showCount;
    }
}

#pragma mark - Public Methods

- (void)centerView
{
    // Center in parent
    self.center = CGPointMake(CGRectGetWidth (self.superview.frame)/2,
                              CGRectGetHeight(self.superview.frame)/2);
}

- (void)show
{
    [self showWithCompletion:nil];
}

- (void)showWithCompletion:(void (^)(BOOL))callback
{
    self.showCount++;
    [self.spinner startAnimating];
    [UIView animateWithDuration:0.5
                     animations:^{
                         self.alpha = 1.0;
                     }
                     completion:^(BOOL finished) {
                         if (callback) {
                             callback(finished);
                         }
                     }];
}

- (void)dismiss
{
    [self dismissWithCompletion:nil];
}

- (void)dismissWithCompletion:(void (^)(BOOL))callback
{
    self.showCount--;
    if (self.loading) {
        NSLog(@"Hide Skipped");
        return;
    }
    // The number of "dismiss" method calls
    // Should be equal to the number of "shows"
    [UIView animateWithDuration:0.5
                     animations:^{
                         self.alpha = 0.0;
                     }
                     completion:^(BOOL finished) {
                         if (finished) {
                             [self.spinner stopAnimating];
                         }
                         if (callback) {
                             callback(finished);
                         }
                     }];
}

#pragma mark - Lifecycle

- (id)initWithCoder:(NSCoder *)aDecoder
{
    self = [super initWithCoder:aDecoder];
    if (self) {
        // We don't want this view to obstruct
        // any of the UI elements below it
        self.userInteractionEnabled = NO;

        // Init the style
        self.alpha = 0.0;
        self.layer.cornerRadius = 5;
    }
    return self;
}

#pragma mark - Class Methods

+ (LoadingView *)loadingView
{
    // Load xib file whose name matches this class name
    NSArray *xib = [[NSBundle mainBundle] loadNibNamed:NSStringFromClass([self class])
                                                 owner:self
                                               options:nil];
    // Locate the first view of this class
    for (id view in xib) {
        if ([view isKindOfClass:[self class]]) {
            return view;
        }
    }
    return nil;
}

@end

```

Next create a simple xib file, that looks something like this:

![Loading View XIB](/blog/content/images/2014/Feb/loadingView.png)

After you finish that make sure you set the view class to `LoadingView` just below where it says "Custom Class", like so:

![Set custom class name](/blog/content/images/2014/Feb/loadingViewClass.png)

Also remember to connect the appropriate `IBOutlets` from your label to `loadingLabel` and from your activity spinner to `spinner`.

### Explanation

Alright so most of that code is basic stuff that you should understand pretty easily. The important part, is in my class method `+ (LoadingView *)loadingView;`. This is convenient because now whenever you need to initialize a `LoadingView` in one of your `UIViewControllers` you can simply do something like this:

```objectivec
LoadingView loadingView = [LoadingView loadingView];
[self.view addSubview:loadingView];
[loadingView centerView];

```

Whenever you call this class method, `initWithCoder` will also be called and you can do whatever setup your custom class needs in there. Also, if your custom class isn't something you can just fire and forget, then it's probably a good idea to lazy load it into a property of your `UIViewController`. In my example, keeping the reference is a good idea so that `LoadingView` can be shown over and over again whenever the controller begins some new asynchronous task.

### Controller Integration

Setup in a controller requires three simple steps

1. Include your class at the top `#import "LoadingView.h"`
2. Define a class property to hold you view `@property (strong, nonatomic) LoadingView *loadingView;`
3. Lazy load your view into your corresponding proper

```objectivec
- (LoadingView *)loadingView
{
    if (!_loadingView) {
        _loadingView = [LoadingView loadingView];
        [self.view addSubview:_loadingView];
        [_loadingView centerView];
    }
    return _loadingView;
}

```

Then whenever you need do some asynchronous task and want the user to know you're loading data simply do as follows:

```objectivec
- (void)asynchronousTask
{
	// Begin task
    [self.loadingView show];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 3.0f * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    	// Wait 3 seconds then dismiss
        [self.loadingView dismiss];
    });
}
```

One extra thing to note about my `LoadingView` class is the `showCount`. The `showCount` is important in that it keeps track of how long `LoadingView` should stay open. For example, let's say you fire `asynchronousTask` multiple times before the first 3 seconds is up, we don't want it to hide `LoadingView` prematurely. So to handle that, we increment `showCount` every time it's called and decrement every time it's dismissed. This effectively keeps `LoadingView` visible until all asynchronous tasks finish. `dismiss` only actually hides the view when `showCount` returns to zero.

To see a full working example download and run the following source in Xcode.

[Source Code](/files/LoadingViewDemo.zip)
