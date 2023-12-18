# Knihobot _trial task_

I have used [AdonisJS](https://adonisjs.com/) and tried to follow its conventions.

## Getting started

Install dependencies

```bash
yarn install
```

Run the app

```bash
yarn dev
```

## Notes

- Price factored by condition can be calculated on demand. Hence it's unnecessary- to persist it into the DB. Maybe makes sense for - _caching/performance_ reasons
- Same for _determining the price and title manually_. The state can be derived - from data (nulled price or title)
- For the production implementation I'd consider using a standardised API - response format like JSON API
- The commit history is akin to a feature branch. The commits would get squashed - into a single commit before merging to `main`/`master`
- I have decided to implement the book price API mock in a controllable way instead of the required "respond with 404 for 50% requests". The required approach is hard/impossible to test reliably
- I have decided not to use computed fields because configuring the Lucid ORM seemed like an overkill for the task at hand
- The mocks are not ideal, the developer has to think about whether a mock has been called and the interceptor removed to avoid breaking subsequent test cases
