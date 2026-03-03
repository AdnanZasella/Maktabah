package com.maktabah;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MaktabahApplication {

	public static void main(String[] args) {
		SpringApplication.run(MaktabahApplication.class, args);
	}

}
