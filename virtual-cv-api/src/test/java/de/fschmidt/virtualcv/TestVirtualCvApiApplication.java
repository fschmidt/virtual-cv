package de.fschmidt.virtualcv;

import org.springframework.boot.SpringApplication;

public class TestVirtualCvApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(VirtualCvApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
