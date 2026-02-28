# **6. Running Tests**

This section provides instructions on how to run the test suite for the server application.

Creating and maintaining tests is crucial for ensuring the reliability and stability of the application you are developing. Tests help catch bugs early, verify that new features work as intended, and ensure that existing functionality remains unaffected by changes.

In our backend development, we use the `pytest` framework for writing and running tests. `pytest` is a powerful testing framework that makes it easy to write simple and scalable test cases for Python applications.

## Running the Test Suite

To run the test suite, we first need to set up the testing environment. Our `docker-compose.test.yml` file is already configured to set up a PostgreSQL database specifically for testing purposes. To start the testing environment, run the following command in your terminal from the root directory of the project:

```bash
docker-compose -f docker-compose.test.yml up -d
```

(Remember, you can also do that just by clicking `Run all services` inside the `docker-compose.test.yml` file in VSCode, if you have the Docker extension installed!)

Next, make sure you have activated your virtual environment and navigate to the `server` directory in your terminal. You can then run the following command:

```bash
pytest
```

This command will discover and execute all the test cases defined in the `tests` directory. By default, `pytest` will look for files that start with `test_` or end with `_test.py` and execute the test functions defined within those files.
You should see output in the terminal indicating the progress of the tests, including any failures or errors encountered during execution.
After the tests have completed, you can stop the testing environment by running the following command:

```bash
docker-compose -f docker-compose.test.yml down
```

This command will stop and remove the PostgreSQL container used for testing.
