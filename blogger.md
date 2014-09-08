# Blogger v3 API

Multiple blogs and Blogger Pages are not supported (not necessary for scope of project).

## General Reference
https://developers.google.com/blogger/docs/3.0/getting_started
https://developers.google.com/blogger/docs/3.0/reference/index
http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/
http://code.blogger.com/2012/01/easier-to-use-interface-for-blogger.html
https://developers.google.com/accounts/docs/OAuth2WebServer#incrementalAuth
http://www.threelas.com/2012/12/basic-blog-resources-of-blogger-api-v3.html

* [RFC 3339 Compliant Timestamps](https://www.ietf.org/rfc/rfc3339.txt)

## Why

The JavaScript API was not used because a) only option for non-JS fallback is redirecting to the Blogger hosted site, which defeats my whole intention; b) for fun (certainly not for profit!)

## Features

* Optional rendering of content body with Markdown

## Posts & Search API

### TODO

- [ ] Additional blog variables to support (undecided):
```
blog_id.name, blog_id.description, blog_id.published, blog_id.updated, blog_id.url
blog_id.posts.totalItems
blog_id.locale.language, blog_id.locale.country, blog_id.locale.variant
```

- [ ] Page view API request (probably not)..?

- [ ] Look over params options in detail (googleapis.blogger)

- [ ] https://developers.google.com/blogger/docs/3.0/performance

- [ ] Research back links; see also: https://support.google.com/blogger/answer/42533?hl=en

- [ ] Research RSS feeds

- [ ] Search API (interface); see also: posts.search request

- [ ] Pagination for posts and comments; see also (clue): prev, next tokens in
response header objects... params.maxResults

- [ ] blog/year/month/day URL routing support; see also: params.startDate,
params.endDate for a posts.list request

- [ ] search/label/tag URL routing support; see also: params.labels for a
posts.list request

- [ ] Blog Archive logic

- [ ] Research difference between selfLink and url ?

- [ ] Share buttons; +1 button

## Blog Comments

### TODO

- [ ] Research CAPTCHA plug-ins.
- [ ] Research how best to go about sending a raw HTTP POST body.

- [x] Research for workaround on how to post new comments (Blogger's v2 API
appears to have supported this option [1], except there was no support for
the author field -- comments would appear as though they were coming from
the owner of the blog). **UPDATE:** Enabling anonymous comment posts allows us to 
use Blogger's v2 protocol for posting new comments via Atom feed [1] by changing the
name tag to whatever desired. You can also modify the published and updated timestamp
tags as well by including those two tags. Confirmed via web REST client, using our 
project's OAuth2 authorization token.

1. https://developers.google.com/blogger/docs/2.0/developers_guide_protocol#Comments

**See also:**
* [Comments Feed](http://averylawfirm.blogspot.com/feeds/5726858577617761976/comments/default)

- [ ] Proper formatting / nesting of comment replies
