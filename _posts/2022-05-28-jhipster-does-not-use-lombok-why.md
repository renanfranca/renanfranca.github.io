---
layout: post
title: JHipster does not use lombok. Why?
description: 
date: 2022-05-29 08:00:37 -0300
tags: jhipster
image: 
permalink: /:categories/:title:output_ext
draft: true

---
After I run the [JHipster generator](https://renanfranca.github.io/2022/03/08/my-reasons-to-use-jhipster.html)  for the first time I realized that the back end implemented with spring boot doesn't use [Lombok](https://projectlombok.org/). So I decided to customize the generated code than I realized it wasn't the best way to use JHipster.

## Customize JHipster
When [I realized how awesome JHipster was](https://renanfranca.github.io/2022/02/24/why-did-i-use-jhipster.html) I thought that I should change the generated code to be like the one I used to type manually. So I saw the opportunity to create my own [blueprint](https://www.jhipster.tech/modules/creating-a-blueprint/) with the following custom annotations:
- Add Lombok - @lombok
- Hide comment - @noCodeComment
- Change the database scheme - @schema
- Add [Id GeneratedValue](https://www.baeldung.com/jpa-get-auto-generated-id) to entity - @generatedValue(identity)
- Define column database name - @column(ds_field) 
- Use unsupported types - @newFieldTypeImport(import_class_package_type) and @newFieldType(type)

I opened source my blueprint which customize the server side code:
- [generator-jhipster-custom-server-side-blueprint-private](https://github.com/renanfranca/generator-jhipster-custom-server-side-blueprint-private/tree/custom-annotations-options)
- Here is the class which implement those custom annotations options: [https://github.com/renanfranca/generator-jhipster-custom-server-side-blueprint-private/blob/custom-annotations-options/generators/entity/index.js](https://github.com/renanfranca/generator-jhipster-custom-server-side-blueprint-private/blob/custom-annotations-options/generators/entity/index.js#L170)

Here is a jdl file example which uses my blueprint:
```java  
@lombok  
@schema(MyProject)  
@noCodeComment 
entity RenanClasse (RenanOk) {  
@generatedValue(identity)  
id Long  
@column(ds_name)  
name String
@newFieldTypeImport(java_time_LocalDateTime)  
@newFieldType(LocalDateTime)  
birthday ZonedDateTime
}  
  
// Use Data Transfer Objects (DTO)  
dto * with mapstruct  
  
// Service layer  
service all with serviceClass  
```

## JHipster choose not use Lombok
I found an [issue at jhipster generated project](https://github.com/jhipster/generator-jhipster/issues/398) that list the the reasons to not use lombok. I will quote some of them:
1. > On one project, a new version of the Lombok plugin caused the IDE to crash (I think this was Intellij). So nobody could work anymore.
2.  > On another project, Lombok made the CI server crash (and would have probably caused the production server to crash), as it triggered a bug in the JVM
3.  > On a third project, we achieved 30% performance increase by recoding the equals/hashcode from Lombok
4. > Then, for JHipster, the story is also that we can't ask people to install a plugin on their IDE:
	> -   1st goal is to have a smooth experience: you generate the app and it works in your IDE, by default
	> -   2nd goal is that you can use whatever IDE you want. And some people have very exotic things, for example I just tried [https://codenvy.com/](https://codenvy.com/) -> no plugin for this one, of course

### Entity implementation
In the following example you can see that JHipster implements manually sets and gets. Beyond that you can see it's implement what is called fluent method as I learn it from the [JHipster generator source code](https://github.com/jhipster/generator-jhipster/blob/46b7cf2f8358fa60eaafffdfe242b2873af86ea9/generators/entity-server/templates/src/test/java/package/web/rest/EntityResourceIT.java.ejs#L487) and from [this issue ](https://github.com/jhipster/generator-jhipster/pull/3751)which discuss fluent setters implementation at jhipster.

```java
@Entity
@Table(name = "nap")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Nap implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "start")
    private ZonedDateTime start;

    @Column(name = "jhi_end")
    private ZonedDateTime end;

    @Enumerated(EnumType.STRING)
    @Column(name = "place")
    private Place place;

    @ManyToOne
    private BabyProfile babyProfile;

    @ManyToOne
    private Humor humor;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Nap id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ZonedDateTime getStart() {
        return this.start;
    }

    public Nap start(ZonedDateTime start) {
        this.setStart(start);
        return this;
    }

    public void setStart(ZonedDateTime start) {
        this.start = start;
    }

    public ZonedDateTime getEnd() {
        return this.end;
    }

    public Nap end(ZonedDateTime end) {
        this.setEnd(end);
        return this;
    }

    public void setEnd(ZonedDateTime end) {
        this.end = end;
    }

    public Place getPlace() {
        return this.place;
    }

    public Nap place(Place place) {
        this.setPlace(place);
        return this;
    }

    public void setPlace(Place place) {
        this.place = place;
    }

    public BabyProfile getBabyProfile() {
        return this.babyProfile;
    }

    public void setBabyProfile(BabyProfile babyProfile) {
        this.babyProfile = babyProfile;
    }

    public Nap babyProfile(BabyProfile babyProfile) {
        this.setBabyProfile(babyProfile);
        return this;
    }

    public Humor getHumor() {
        return this.humor;
    }

    public void setHumor(Humor humor) {
        this.humor = humor;
    }

    public Nap humor(Humor humor) {
        this.setHumor(humor);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Nap)) {
            return false;
        }
        return id != null && id.equals(((Nap) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Nap{" +
            "id=" + getId() +
            ", start='" + getStart() + "'" +
            ", end='" + getEnd() + "'" +
            ", place='" + getPlace() + "'" +
            "}";
    }
}
```
source: [_Nap.java_](https://github.com/renanfranca/mamazinha-baby/blob/main/src/main/java/com/mamazinha/baby/domain/Nap.java)

So you can create this object like when you use the builder pattern but it's not immutable.
```java
Nap nap = new Nap().id(1l).start(ZonedDateTime.now()).end(ZonedDateTime.now().plusHours(1));
```

I enjoyed this implementation and that's enough for me to keep my code less verbose.

## This is the way
I gave up to customize JHipster generated code.
I realized that I should accept the jhipster generated code pattern because If I try to customize everything I am creating my own JHipster and I am going to lose the productivity which JHipster could bring to my workflow.
It isn't a trivial job to maintain a blueprint up to date with the latest jhipster generator version. So I advise you to only create a blueprint if it is extremely necessary.